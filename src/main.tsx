import ReactDOM from 'react-dom/client'
import App from './App'
import { RenderStudio } from './render/RenderStudio'
import './styles/base.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/sections.css'
import './styles/overlays.css'
import './styles/three.css'

const isRenderRoute = new URLSearchParams(window.location.search).has('render')

ReactDOM.createRoot(document.getElementById('root')!).render(
  isRenderRoute ? <RenderStudio /> : <App />,
)
