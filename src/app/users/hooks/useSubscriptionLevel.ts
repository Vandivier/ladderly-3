import { useEffect, useState } from "react"
import { PaymentTierEnum } from "db"
import { useCurrentUser } from "./useCurrentUser"

const tiersOrder = {
  FREE: 0,
  PAY_WHAT_YOU_CAN: 1,
  PREMIUM: 2,
}

const useSubscriptionLevel = () => {
  const user = useCurrentUser()
  const [tier, setTier] = useState<PaymentTierEnum | null>(null)

  useEffect(() => {
    if (user && user.subscriptions.length > 0) {
      let minTier: PaymentTierEnum = PaymentTierEnum.PREMIUM

      for (const subscription of user.subscriptions) {
        if (subscription.tier === PaymentTierEnum.PREMIUM) {
          minTier = PaymentTierEnum.PREMIUM
          break
        } else if (
          subscription.tier === PaymentTierEnum.PAY_WHAT_YOU_CAN &&
          tiersOrder[minTier] > tiersOrder[PaymentTierEnum.PAY_WHAT_YOU_CAN]
        ) {
          minTier = PaymentTierEnum.PAY_WHAT_YOU_CAN
        } else if (
          subscription.tier === PaymentTierEnum.FREE &&
          tiersOrder[minTier] > tiersOrder[PaymentTierEnum.FREE]
        ) {
          minTier = PaymentTierEnum.FREE
        }
      }
      setTier(minTier)
    } else {
      setTier(PaymentTierEnum.FREE)
    }
  }, [user])

  return { user, tier }
}

export default useSubscriptionLevel
