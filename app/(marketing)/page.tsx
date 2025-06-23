'use client'

import {
  Box,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Stack,
  Tag,
  Text,
  VStack,
  Wrap,
  useClipboard,
} from '@chakra-ui/react'
import { Br, Link } from '@saas-ui/react'
import type { Metadata, NextPage } from 'next'
import {
  FiArrowRight,
  FiBox,
  FiCheck,
  FiCode,
  FiCopy,
  FiFlag,
  FiGrid,
  FiLock,
  FiSearch,
  FiSliders,
  FiSmile,
  FiTerminal,
  FiThumbsUp,
  FiToggleLeft,
  FiTrendingUp,
  FiUserPlus,
} from 'react-icons/fi'

import * as React from 'react'

import { ButtonLink } from '#components/button-link/button-link'
import { Faq } from '#components/faq'
import { Features } from '#components/features'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Hero } from '#components/hero'
import {
  Highlights,
  HighlightsItem,
  HighlightsTestimonialItem,
} from '#components/highlights'
import { ChakraLogo, NextjsLogo } from '#components/logos'
import { FallInPlace } from '#components/motion/fall-in-place'
import { Pricing } from '#components/pricing/pricing'
import { Testimonial, Testimonials } from '#components/testimonials'
import { Em } from '#components/typography'
import faq from '#data/faq'
import pricing from '#data/pricing'
import testimonials from '#data/testimonials'
import { RoofDemo } from '#components/roof-demo'

export const meta: Metadata = {
  title: 'MyRoofGenius',
  description: 'Intelligent systems that protect every commercial roofing decision.',
}

const Home: NextPage = () => {
  return (
    <Box>
      <HeroSection />

      <HighlightsSection />

      <FeaturesSection />

      <TestimonialsSection />

      <PricingSection />

      <FaqSection />
    </Box>
  )
}

const HeroSection: React.FC = () => {
  return (
    <Box position="relative" overflow="hidden">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" pt={{ base: 40, lg: 60 }} pb="40">
        <Stack direction={{ base: 'column', lg: 'row' }} alignItems="center">
          <Hero
            id="home"
            justifyContent="flex-start"
            px="0"
            title={
              <FallInPlace>
                Build resilient
                <Br /> roofs with AI‑driven insights
              </FallInPlace>
            }
            description={
              <FallInPlace delay={0.4} fontWeight="medium">
                MyRoofGenius is an <Em>AI‑powered platform</Em>
                <Br /> that safeguards every commercial roofing decision.
              </FallInPlace>
            }
          >
            <FallInPlace delay={0.8}>
              <HStack pt="4" pb="12" spacing="8">
                <NextjsLogo height="28px" /> <ChakraLogo height="20px" />
              </HStack>

              <ButtonGroup spacing={4} alignItems="center">
                <ButtonLink colorScheme="primary" size="lg" href="/signup">
                  Sign Up
                </ButtonLink>
                <ButtonLink
                  size="lg"
                  href="#benefits"
                  variant="outline"
                  rightIcon={
                    <Icon
                      as={FiArrowRight}
                      sx={{
                        transitionProperty: 'common',
                        transitionDuration: 'normal',
                        '.chakra-button:hover &': {
                          transform: 'translate(5px)',
                        },
                      }}
                    />
                  }
                >
                  Learn more
                </ButtonLink>
              </ButtonGroup>
            </FallInPlace>
          </Hero>
          <Box
            height="600px"
            position="absolute"
            display={{ base: 'none', lg: 'block' }}
            left={{ lg: '60%', xl: '55%' }}
            width="80vw"
            maxW="1100px"
            margin="0 auto"
          >
            <FallInPlace delay={1}>
              <Box overflow="hidden" height="100%">
                <RoofDemo />
              </Box>
            </FallInPlace>
          </Box>
        </Stack>
      </Container>

      <Features
        id="benefits"
        columns={[1, 2, 4]}
        iconSize={4}
        innerWidth="container.xl"
        pt="20"
        features={[
          {
            title: 'AI damage detection',
            icon: FiSearch,
            description: 'Automatically identify roof issues from photos and drone scans.',
            iconPosition: 'left',
            delay: 0.6,
          },
          {
            title: 'Code compliance',
            icon: FiCheck,
            description: 'Verify local building codes before finalizing a proposal.',
            iconPosition: 'left',
            delay: 0.8,
          },
          {
            title: 'Precise estimates',
            icon: FiTrendingUp,
            description: 'Generate accurate material and labor costs in seconds.',
            iconPosition: 'left',
            delay: 1,
          },
          {
            title: 'Team collaboration',
            icon: FiUserPlus,
            description: 'Share roof plans and updates with your entire crew in one dashboard.',
            iconPosition: 'left',
            delay: 1.1,
          },
        ]}
        reveal={FallInPlace}
      />
    </Box>
  )
}

const HighlightsSection = () => {
  const { value, onCopy, hasCopied } = useClipboard('myroofgenius.com/signup')

  return (
    <Highlights>
      <HighlightsItem colSpan={[1, null, 2]} title="Core components">
        <VStack alignItems="flex-start" spacing="8">
          <Text color="muted" fontSize="xl">
            Explore AI‑powered tools that keep projects on track and under budget.
            Analyze materials, verify codes, and generate accurate estimates effortlessly.
          </Text>

          <Flex
            rounded="full"
            borderWidth="1px"
            flexDirection="row"
            alignItems="center"
            py="1"
            ps="8"
            pe="2"
            bg="primary.900"
            _dark={{ bg: 'gray.900' }}
          >
            <Box>
              <Text color="yellow.400" display="inline">
                https://
              </Text>{' '}
              <Text color="cyan.300" display="inline">
                myroofgenius.com/signup
              </Text>
            </Box>
            <IconButton
              icon={hasCopied ? <FiCheck /> : <FiCopy />}
              aria-label="Copy link"
              onClick={onCopy}
              variant="ghost"
              ms="4"
              isRound
              color="white"
            />
          </Flex>
        </VStack>
      </HighlightsItem>
      <HighlightsItem title="Solid foundations">
        <Text color="muted" fontSize="lg">
          We don&apos;t like to re-invent the wheel, neither should you. We
          selected the most reliable industry data available and
          built MyRoofGenius on top of it.
        </Text>
      </HighlightsItem>
      <HighlightsTestimonialItem
        name="Renata Alink"
        description="Founder"
        avatar="/static/images/avatar.jpg"
        gradient={['pink.200', 'purple.500']}
      >
        “MyRoofGenius streamlined our estimating workflow and uncovered issues
        we would have missed. It saved us weeks of rework.”
      </HighlightsTestimonialItem>
      <HighlightsItem colSpan={[1, null, 2]} title="Built for roofing professionals">
        <Text color="muted" fontSize="lg">
          MyRoofGenius includes the essentials for confident planning and execution.
        </Text>
        <Wrap mt="8">
          {[
            'AI damage detection',
            'Code compliance',
            'Precise estimates',
            'Material planning',
            'Risk forecasting',
            'Team collaboration',
            'Automated reports',
            'Weather insights',
          ].map((value) => (
            <Tag
              key={value}
              variant="subtle"
              colorScheme="purple"
              rounded="full"
              px="3"
            >
              {value}
            </Tag>
          ))}
        </Wrap>
      </HighlightsItem>
    </Highlights>
  )
}

const FeaturesSection = () => {
  return (
    <Features
      id="features"
      title={
        <Heading
          lineHeight="short"
          fontSize={['2xl', null, '4xl']}
          textAlign="left"
          as="p"
        >
          Tools that keep every project on track
        </Heading>
      }
      description={
        <>
          MyRoofGenius combines field expertise with real-time analysis.
          <Br />
          Catch specification issues early and budget with confidence.
        </>
      }
      align="left"
      columns={[1, 2, 3]}
      iconSize={4}
      features={[
        {
          title: 'AI damage detection',
          icon: FiSearch,
          description:
            'Analyze roof photos and drone scans to identify trouble spots automatically.',
          variant: 'inline',
        },
        {
          title: 'Specification checks',
          icon: FiCheck,
          description:
            'Verify materials and codes before proposals go out the door.',
          variant: 'inline',
        },
        {
          title: 'Precise cost planning',
          icon: FiTrendingUp,
          description:
            'Generate accurate material and labor estimates in seconds.',
          variant: 'inline',
        },
        {
          title: 'Collaborative workspace',
          icon: FiUserPlus,
          description:
            'Share roof data and updates with your entire crew in one place.',
          variant: 'inline',
        },
        {
          title: 'Automated reporting',
          icon: FiTerminal,
          description:
            'Create professional client reports with a single click.',
          variant: 'inline',
        },
        {
          title: 'Project history',
          icon: FiThumbsUp,
          description:
            'Track inspections and maintenance records over the life of a roof.',
          variant: 'inline',
        },
      ]}
    />
  )
}

const TestimonialsSection = () => {
  const columns = React.useMemo(() => {
    return testimonials.items.reduce<Array<typeof testimonials.items>>(
      (columns, t, i) => {
        columns[i % 3].push(t)

        return columns
      },
      [[], [], []],
    )
  }, [])

  return (
    <Testimonials
      title={testimonials.title}
      columns={[1, 2, 3]}
      innerWidth="container.xl"
    >
      <>
        {columns.map((column, i) => (
          <Stack key={i} spacing="8">
            {column.map((t, i) => (
              <Testimonial key={i} {...t} />
            ))}
          </Stack>
        ))}
      </>
    </Testimonials>
  )
}

const PricingSection = () => {
  return (
    <Pricing {...pricing}>
      <Text p="8" textAlign="center" color="muted">
        VAT may be applicable depending on your location.
      </Text>
    </Pricing>
  )
}

const FaqSection = () => {
  return <Faq {...faq} />
}

export default Home
