'use client';
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Star, ShoppingCart, Eye } from 'lucide-react';
import ProductCarousel from '../../components/marketplace/ProductCarousel';
import ContractorGrid from '../../components/marketplace/ContractorGrid';
import { Product as RecommendedProduct, Contractor } from '../../types/marketplace';

const categories = [
  { id: 'all', name: 'All Products', icon: '🏠' },
  { id: 'estimation', name: 'Estimation Tools', icon: '📊' },
  { id: 'templates', name: 'Contract Templates', icon: '📋' },
  { id: 'checklists', name: 'Inspection Checklists', icon: '✅' },
  { id: 'financial', name: 'Financial Tools', icon: '💰' },
  { id: 'safety', name: 'Safety Resources', icon: '⚠️' },
  { id: 'training', name: 'Training Materials', icon: '🎓' },
  { id: 'marketing', name: 'Marketing Assets', icon: '📣' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  price_id: string
  category: string
  image_url: string
  features: string
  rating: number
  reviews_count: number
  sales_count: number
  is_featured: boolean
  is_new: boolean
  created_at?: string | Date // add if missing in your DB
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<{
    products: RecommendedProduct[]
    contractors: Contractor[]
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // --- FIXED: filterAndSortProducts must be declared before useEffect that uses it!
  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.sales_count - a.sales_count);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy, priceRange]);

  // --- Call data fetching in useEffect (not a self-invoking function)
  useEffect(() => {
    fetchProducts();
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  async function fetchProducts() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setLoading(false);
      return;
    }
    const supabase = createClient(url, key);

    const { data, error: _error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      // Simulate additional product data for demo
      const enrichedProducts = data.map((product: Product) => ({
        ...product,
        rating: 4.5 + Math.random() * 0.5,
        reviews_count: Math.floor(Math.random() * 200) + 10,
        sales_count: Math.floor(Math.random() * 1000) + 50,
        is_featured: Math.random() > 0.7,
        is_new: Math.random() > 0.8,
      }));
      setProducts(enrichedProducts);
    }
    setLoading(false);
  }

  async function fetchRecommendations() {
    try {
      const res = await fetch('/api/marketplace/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch {
      /* ignored */
    }
  }

  const buyNow = async (product: Product) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: product.price_id, product_id: product.id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      /* ignore checkout errors */
    }
  };

  // ... (the entire UI block remains unchanged; no changes needed below) ...

// [PASTE THE REST OF YOUR COMPONENT JSX FROM YOUR ORIGINAL]
