import { useEffect, useState } from "react"

interface ScrollToggleOptions {
  threshold?: number
  showOnMount?: boolean
  smooth?: boolean
}

export function useScrollToggle(options: ScrollToggleOptions = {}) {
  const {
    threshold = 400,
    showOnMount = false,
    smooth = true,
  } = options

  const [isVisible, setIsVisible] = useState(showOnMount)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const toggleVisibility = () => {
      if (typeof window === "undefined") return
      setIsVisible(window.pageYOffset > threshold)
    }

    toggleVisibility()
    window.addEventListener("scroll", toggleVisibility, { passive: true })
    window.addEventListener("resize", toggleVisibility, { passive: true })

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
      window.removeEventListener("resize", toggleVisibility)
    }
  }, [threshold, mounted])

  const scrollToTop = () => {
    if (typeof window === "undefined") return
    if (smooth) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      window.scrollTo(0, 0)
    }
  }

  return {
    isVisible,
    scrollToTop,
    mounted,
  }
}

