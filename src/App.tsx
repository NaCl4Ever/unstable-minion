import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import PromptEntry from './components/PromptEntry/PromptEntry'

function App() {

  return (
    <ChakraProvider>
      <PromptEntry/>
    </ChakraProvider>
  )
}

export default App
