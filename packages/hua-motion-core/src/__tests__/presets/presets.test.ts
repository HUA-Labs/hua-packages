// ========================================
// HUA Motion Core - Presets Tests
// ========================================

import { describe, it, expect } from 'vitest'
import {
  MOTION_PRESETS,
  PAGE_MOTIONS,
  mergeWithPreset,
  getPagePreset,
  getMotionPreset
} from '../../presets'

// ========================================
// MOTION_PRESETS Structure
// ========================================

describe('MOTION_PRESETS structure', () => {
  it('should have all 6 preset types', () => {
    const keys = Object.keys(MOTION_PRESETS)
    expect(keys).toHaveLength(6)
    expect(keys).toContain('hero')
    expect(keys).toContain('title')
    expect(keys).toContain('button')
    expect(keys).toContain('card')
    expect(keys).toContain('text')
    expect(keys).toContain('image')
  })

  it('each preset should have entrance, delay, duration, hover, click properties', () => {
    Object.values(MOTION_PRESETS).forEach((preset) => {
      expect(preset).toHaveProperty('entrance')
      expect(preset).toHaveProperty('delay')
      expect(preset).toHaveProperty('duration')
      expect(preset).toHaveProperty('hover')
      expect(preset).toHaveProperty('click')
    })
  })
})

describe('MOTION_PRESETS.hero', () => {
  it('should have correct values', () => {
    expect(MOTION_PRESETS.hero.entrance).toBe('fadeIn')
    expect(MOTION_PRESETS.hero.delay).toBe(200)
    expect(MOTION_PRESETS.hero.duration).toBe(800)
    expect(MOTION_PRESETS.hero.hover).toBe(false)
    expect(MOTION_PRESETS.hero.click).toBe(false)
  })
})

describe('MOTION_PRESETS.title', () => {
  it('should have correct values', () => {
    expect(MOTION_PRESETS.title.entrance).toBe('slideUp')
    expect(MOTION_PRESETS.title.delay).toBe(400)
    expect(MOTION_PRESETS.title.duration).toBe(700)
    expect(MOTION_PRESETS.title.hover).toBe(false)
    expect(MOTION_PRESETS.title.click).toBe(false)
  })
})

describe('MOTION_PRESETS.button', () => {
  it('should have correct values', () => {
    expect(MOTION_PRESETS.button.entrance).toBe('scaleIn')
    expect(MOTION_PRESETS.button.delay).toBe(600)
    expect(MOTION_PRESETS.button.duration).toBe(300)
    expect(MOTION_PRESETS.button.hover).toBe(true)
    expect(MOTION_PRESETS.button.click).toBe(true)
  })
})

describe('MOTION_PRESETS.card', () => {
  it('should have correct values', () => {
    expect(MOTION_PRESETS.card.entrance).toBe('slideUp')
    expect(MOTION_PRESETS.card.delay).toBe(800)
    expect(MOTION_PRESETS.card.duration).toBe(500)
    expect(MOTION_PRESETS.card.hover).toBe(true)
    expect(MOTION_PRESETS.card.click).toBe(false)
  })
})

describe('MOTION_PRESETS.text', () => {
  it('should have correct values', () => {
    expect(MOTION_PRESETS.text.entrance).toBe('fadeIn')
    expect(MOTION_PRESETS.text.delay).toBe(200)
    expect(MOTION_PRESETS.text.duration).toBe(600)
    expect(MOTION_PRESETS.text.hover).toBe(false)
    expect(MOTION_PRESETS.text.click).toBe(false)
  })
})

describe('MOTION_PRESETS.image', () => {
  it('should have correct values', () => {
    expect(MOTION_PRESETS.image.entrance).toBe('scaleIn')
    expect(MOTION_PRESETS.image.delay).toBe(400)
    expect(MOTION_PRESETS.image.duration).toBe(600)
    expect(MOTION_PRESETS.image.hover).toBe(true)
    expect(MOTION_PRESETS.image.click).toBe(false)
  })
})

// ========================================
// PAGE_MOTIONS Structure
// ========================================

describe('PAGE_MOTIONS structure', () => {
  it('should have 4 page types', () => {
    const keys = Object.keys(PAGE_MOTIONS)
    expect(keys).toHaveLength(4)
    expect(keys).toContain('home')
    expect(keys).toContain('dashboard')
    expect(keys).toContain('product')
    expect(keys).toContain('blog')
  })
})

describe('PAGE_MOTIONS.home', () => {
  it('should have correct elements', () => {
    const home = PAGE_MOTIONS.home
    expect(home).toHaveProperty('hero')
    expect(home).toHaveProperty('title')
    expect(home).toHaveProperty('description')
    expect(home).toHaveProperty('cta')
    expect(home).toHaveProperty('feature1')
    expect(home).toHaveProperty('feature2')
    expect(home).toHaveProperty('feature3')
  })

  it('should have correct types for elements', () => {
    expect(PAGE_MOTIONS.home.hero.type).toBe('hero')
    expect(PAGE_MOTIONS.home.title.type).toBe('title')
    expect(PAGE_MOTIONS.home.description.type).toBe('text')
    expect(PAGE_MOTIONS.home.cta.type).toBe('button')
    expect(PAGE_MOTIONS.home.feature1.type).toBe('card')
    expect(PAGE_MOTIONS.home.feature2.type).toBe('card')
    expect(PAGE_MOTIONS.home.feature3.type).toBe('card')
  })
})

describe('PAGE_MOTIONS.dashboard', () => {
  it('should have correct elements', () => {
    const dashboard = PAGE_MOTIONS.dashboard
    expect(dashboard).toHaveProperty('header')
    expect(dashboard).toHaveProperty('sidebar')
    expect(dashboard).toHaveProperty('main')
    expect(dashboard).toHaveProperty('card1')
    expect(dashboard).toHaveProperty('card2')
    expect(dashboard).toHaveProperty('card3')
    expect(dashboard).toHaveProperty('chart')
  })

  it('should have correct types for elements', () => {
    expect(PAGE_MOTIONS.dashboard.header.type).toBe('hero')
    expect(PAGE_MOTIONS.dashboard.sidebar.type).toBe('card')
    expect(PAGE_MOTIONS.dashboard.main.type).toBe('text')
    expect(PAGE_MOTIONS.dashboard.card1.type).toBe('card')
    expect(PAGE_MOTIONS.dashboard.card2.type).toBe('card')
    expect(PAGE_MOTIONS.dashboard.card3.type).toBe('card')
    expect(PAGE_MOTIONS.dashboard.chart.type).toBe('image')
  })

  it('should have custom entrance animations for sidebar and main', () => {
    expect(PAGE_MOTIONS.dashboard.sidebar.entrance).toBe('slideLeft')
    expect(PAGE_MOTIONS.dashboard.main.entrance).toBe('fadeIn')
  })
})

describe('PAGE_MOTIONS.product', () => {
  it('should have correct elements', () => {
    const product = PAGE_MOTIONS.product
    expect(product).toHaveProperty('hero')
    expect(product).toHaveProperty('title')
    expect(product).toHaveProperty('image')
    expect(product).toHaveProperty('description')
    expect(product).toHaveProperty('price')
    expect(product).toHaveProperty('buyButton')
    expect(product).toHaveProperty('features')
  })

  it('should have correct types for elements', () => {
    expect(PAGE_MOTIONS.product.hero.type).toBe('hero')
    expect(PAGE_MOTIONS.product.title.type).toBe('title')
    expect(PAGE_MOTIONS.product.image.type).toBe('image')
    expect(PAGE_MOTIONS.product.description.type).toBe('text')
    expect(PAGE_MOTIONS.product.price.type).toBe('text')
    expect(PAGE_MOTIONS.product.buyButton.type).toBe('button')
    expect(PAGE_MOTIONS.product.features.type).toBe('card')
  })
})

describe('PAGE_MOTIONS.blog', () => {
  it('should have correct elements', () => {
    const blog = PAGE_MOTIONS.blog
    expect(blog).toHaveProperty('header')
    expect(blog).toHaveProperty('title')
    expect(blog).toHaveProperty('content')
    expect(blog).toHaveProperty('sidebar')
    expect(blog).toHaveProperty('related1')
    expect(blog).toHaveProperty('related2')
    expect(blog).toHaveProperty('related3')
  })

  it('should have correct types for elements', () => {
    expect(PAGE_MOTIONS.blog.header.type).toBe('hero')
    expect(PAGE_MOTIONS.blog.title.type).toBe('title')
    expect(PAGE_MOTIONS.blog.content.type).toBe('text')
    expect(PAGE_MOTIONS.blog.sidebar.type).toBe('card')
    expect(PAGE_MOTIONS.blog.related1.type).toBe('card')
    expect(PAGE_MOTIONS.blog.related2.type).toBe('card')
    expect(PAGE_MOTIONS.blog.related3.type).toBe('card')
  })

  it('should have custom entrance animation for sidebar', () => {
    expect(PAGE_MOTIONS.blog.sidebar.entrance).toBe('slideRight')
  })
})

// ========================================
// Utility Functions
// ========================================

describe('mergeWithPreset', () => {
  it('should return preset copy when no custom config provided', () => {
    const preset = MOTION_PRESETS.hero
    const result = mergeWithPreset(preset)
    expect(result).toEqual(preset)
    expect(result).not.toBe(preset) // should be a new object
  })

  it('should return preset copy when empty custom config provided', () => {
    const preset = MOTION_PRESETS.hero
    const result = mergeWithPreset(preset, {})
    expect(result).toEqual(preset)
    expect(result).not.toBe(preset)
  })

  it('should override delay in preset', () => {
    const preset = MOTION_PRESETS.hero
    const result = mergeWithPreset(preset, { delay: 100 })
    expect(result.delay).toBe(100)
    expect(result.entrance).toBe(preset.entrance)
    expect(result.duration).toBe(preset.duration)
    expect(result.hover).toBe(preset.hover)
    expect(result.click).toBe(preset.click)
  })

  it('should override duration in preset', () => {
    const preset = MOTION_PRESETS.button
    const result = mergeWithPreset(preset, { duration: 1000 })
    expect(result.duration).toBe(1000)
    expect(result.entrance).toBe(preset.entrance)
    expect(result.delay).toBe(preset.delay)
  })

  it('should override entrance in preset', () => {
    const preset = MOTION_PRESETS.card
    const result = mergeWithPreset(preset, { entrance: 'fadeIn' })
    expect(result.entrance).toBe('fadeIn')
    expect(result.delay).toBe(preset.delay)
    expect(result.duration).toBe(preset.duration)
  })

  it('should override hover and click in preset', () => {
    const preset = MOTION_PRESETS.hero
    const result = mergeWithPreset(preset, { hover: true, click: true })
    expect(result.hover).toBe(true)
    expect(result.click).toBe(true)
    expect(result.entrance).toBe(preset.entrance)
  })

  it('should override multiple properties', () => {
    const preset = MOTION_PRESETS.text
    const result = mergeWithPreset(preset, {
      delay: 50,
      duration: 400,
      hover: true
    })
    expect(result.delay).toBe(50)
    expect(result.duration).toBe(400)
    expect(result.hover).toBe(true)
    expect(result.entrance).toBe(preset.entrance)
    expect(result.click).toBe(preset.click)
  })
})

describe('getPagePreset', () => {
  it('should return home page config', () => {
    const result = getPagePreset('home')
    expect(result).toBe(PAGE_MOTIONS.home)
  })

  it('should return dashboard page config', () => {
    const result = getPagePreset('dashboard')
    expect(result).toBe(PAGE_MOTIONS.dashboard)
  })

  it('should return product page config', () => {
    const result = getPagePreset('product')
    expect(result).toBe(PAGE_MOTIONS.product)
  })

  it('should return blog page config', () => {
    const result = getPagePreset('blog')
    expect(result).toBe(PAGE_MOTIONS.blog)
  })
})

describe('getMotionPreset', () => {
  it('should return hero preset for "hero" type', () => {
    const result = getMotionPreset('hero')
    expect(result).toBe(MOTION_PRESETS.hero)
  })

  it('should return title preset for "title" type', () => {
    const result = getMotionPreset('title')
    expect(result).toBe(MOTION_PRESETS.title)
  })

  it('should return button preset for "button" type', () => {
    const result = getMotionPreset('button')
    expect(result).toBe(MOTION_PRESETS.button)
  })

  it('should return card preset for "card" type', () => {
    const result = getMotionPreset('card')
    expect(result).toBe(MOTION_PRESETS.card)
  })

  it('should return text preset for "text" type', () => {
    const result = getMotionPreset('text')
    expect(result).toBe(MOTION_PRESETS.text)
  })

  it('should return image preset for "image" type', () => {
    const result = getMotionPreset('image')
    expect(result).toBe(MOTION_PRESETS.image)
  })

  it('should fallback to text preset for unknown type', () => {
    const result = getMotionPreset('unknown')
    expect(result).toBe(MOTION_PRESETS.text)
  })

  it('should fallback to text preset for empty string', () => {
    const result = getMotionPreset('')
    expect(result).toBe(MOTION_PRESETS.text)
  })

  it('should fallback to text preset for non-existent type', () => {
    const result = getMotionPreset('nonexistent')
    expect(result).toBe(MOTION_PRESETS.text)
  })
})
