import IndexPage from "./pages/index.vue"
import SoundboardPage from "@features/soundboard/pages/SoundboardPage.vue"
import InvestigationWebPage from "@features/investigation-web/pages/InvestigationWebPage.vue"

import type { RouteRecordRaw } from "vue-router"

export const routes: RouteRecordRaw[] = [
  { path: "", name: "Home", component: IndexPage },
  { path: "/", name: "Home", component: IndexPage },
  { path: "/player", name: "Player", component: IndexPage },
  { path: "/investigation-web", name: "Investigation Web", component: InvestigationWebPage },
  { path: "/soundboard", name: "Soundboard", component: SoundboardPage },
]

export default routes
