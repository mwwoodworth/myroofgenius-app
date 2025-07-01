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
  created_at?: string | Date
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

  // --- Call data fetching in useEffect
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

  // ---------- HERE'S THE COMPLETE UI RETURN ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Professional Roofing Tools & Templates</h1>
              <p className="text-xl text-blue-100">
                Save hours on every project with battle-tested resources used by 2,800+ contractors
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm">
                  ✨ Instant Download
                </div>
                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm">
                  💯 30-Day Guarantee
                </div>
                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm">
                  🔄 Lifetime Updates
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
              <p className="text-3xl font-bold">{products.length}</p>
              <p className="text-blue-100">Products Available</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for estimation tools, templates, checklists..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            ${showFilters ? 'block' : 'hidden'} 
            lg:block w-full lg:w-64 flex-shrink-0
          `}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition
                      ${selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border rounded-lg"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Results Count */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {recommendations?.products && recommendations.products.length > 0 && (
              <div className="mb-8">
                <ProductCarousel products={recommendations.products} />
              </div>
            )}

            {/* Featured Products */}
            {filteredProducts.filter(p => p.is_featured).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProducts.filter(p => p.is_featured).slice(0, 2).map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden group"
                    >
                      <div className="flex">
                        <div className="w-1/3 relative">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                          {product.is_new && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex-1 p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">
                                ({product.reviews_count})
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {product.sales_count} sold
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold">${product.price}</span>
                              {product.original_price && (
                                <span className="text-gray-500 line-through ml-2">
                                  ${product.original_price}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={`/product/${product.id}`}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                View Details
                              </Link>
                              <button
                                onClick={() => buyNow(product)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                    setPriceRange([0, 500]);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.filter(p => !p.is_featured).map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden group"
                  >
                    <div className="aspect-w-16 aspect-h-9 relative">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={640}
                        height={360}
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                      />
                      {product.is_new && (
                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          NEW
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition">
                          {product.name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {categories.find(c => c.id === product.category)?.name}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Features */}
                      <div className="mb-4">
                        <ul className="text-xs text-gray-500 space-y-1">
                          {product.features.split(',').slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="text-green-500">✓</span>
                              {feature.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Rating and Sales */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {product.sales_count} sold
                        </span>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold">${product.price}</span>
                          {product.original_price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.original_price}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/product/${product.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => buyNow(product)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Buy Now"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredProducts.length > 12 && (
              <div className="mt-8 text-center">
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Load More Products
                </button>
              </div>
            )}

            {recommendations?.contractors && recommendations.contractors.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Recommended Contractors</h2>
                <ContractorGrid contractors={recommendations.contractors} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Newsletter CTA */}
      <section className="bg-blue-600 py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Exclusive Deals & New Product Updates
          </h2>
          <p className="text-blue-100 mb-6">
            Join 2,800+ contractors receiving weekly deals and industry insights
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
