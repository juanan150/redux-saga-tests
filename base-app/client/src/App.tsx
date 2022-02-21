import { NavBar } from './app/components/nav/NavBar'
import { Routes } from './app/components/nav/Routes'
import { useGlobalToast } from './features/toast/hooks/useGlobalToast'

export function App(): React.ReactElement {
  //test
  useGlobalToast()
  return (
    <>
      <NavBar />
      <Routes />
    </>
  )
}
