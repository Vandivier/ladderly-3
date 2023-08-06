import { TopNavCenter } from "./TopNavCenter"
import { TopNavLeft } from "./TopNavLeft"
import { TopNavRight } from "./TopNavRight"

export const TopNav = () => (
  <div className="border-ladderly-light-purple flex items-center border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
    <TopNavLeft />
    <TopNavCenter />
    {/* <TopNavRight /> */}
  </div>
)
