import { useState, useEffect, useCallback } from 'react'

interface EthPriceResult {
  price: number | null
  loading: boolean
  error: string | null
  stale: boolean
}

export function useEthPrice(): EthPriceResult {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  const fetchPrice = useCallback(async () => {
    try {
      // Binance public API — CORS-friendly, no API key needed
      const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const newPrice = parseFloat(data.price)
      if (isNaN(newPrice)) throw new Error('Invalid price')
      setPrice(newPrice)
      setLastUpdate(Date.now())
      setError(null)
    } catch (e) {
      // Fallback to CoinGecko
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const newPrice = data.ethereum?.usd
        if (typeof newPrice !== 'number') throw new Error('Invalid price')
        setPrice(newPrice)
        setLastUpdate(Date.now())
        setError(null)
      } catch (fallbackErr) {
        setError('Price feed unavailable')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [fetchPrice])

  const stale = Date.now() - lastUpdate > 120000

  return { price, loading, error, stale }
}