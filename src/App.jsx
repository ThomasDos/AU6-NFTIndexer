import { Box, Button, Center, Flex, Heading, Image, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { Alchemy, Network } from 'alchemy-sdk'
import { providers, utils } from 'ethers'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

const config = {
  //@ts-ignore
  apiKey: import.meta.env.VITE_TESTNET_GOERLI_ALCHEMY_KEY,
  network: Network.ETH_GOERLI
}
//@ts-ignore
const provider = new providers.Web3Provider(window.ethereum)
const alchemy = new Alchemy(config)

function App() {
  const [userAddress, setUserAddress] = useState('')
  const [results, setResults] = useState([])
  const [hasQueried, setHasQueried] = useState(false)
  const [inputAddress, setInputAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const connectwalletHandler = () => {
    //@ts-ignore
    if (window.ethereum) {
      provider.send('eth_requestAccounts', []).then(async () => {
        const signer = await provider.getSigner().getAddress()
        setUserAddress(signer)
        getNFTsForOwner(signer)
      })
    } else {
      toast.error('Please Install Metamask!!!')
    }
  }

  const handleSearchAddress = async () => {
    if (!inputAddress) return toast.error('Please enter an address!')
    const ensAddress = await provider.resolveName('vitalik.eth')
    if (ensAddress) {
      setUserAddress(ensAddress)
      return getNFTsForOwner(inputAddress)
    }

    const inputIsHex = utils.isHexString(inputAddress)
    if (!inputIsHex) return toast.error("That's not a valid address!")
    setUserAddress(inputAddress)
    getNFTsForOwner(inputAddress)
  }

  async function getNFTsForOwner(address) {
    if (!address) return
    setIsLoading(true)

    const data = await alchemy.nft.getNftsForOwner(address)
    //@ts-ignore
    setResults(data)

    setHasQueried(true)
    setIsLoading(false)
  }

  const handleReset = () => {
    setInputAddress('')
    setUserAddress('')
    setHasQueried(false)
  }

  return (
    <Box w='100vw'>
      <Center>
        <Flex alignItems={'center'} justifyContent='center' flexDirection={'column'}>
          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>Plug in an address and this website will return all of its NFTs!</Text>
        </Flex>
      </Center>
      <Flex w='100%' flexDirection='column' alignItems='center' justifyContent={'center'}>
        <Heading mt={42}>Get all the ERC-20 token balances of this address:</Heading>
        {userAddress ? (
          userAddress
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearchAddress()
            }}
          >
            <Input
              onChange={(e) => setInputAddress(e.target.value)}
              color='black'
              w='600px'
              textAlign='center'
              p={4}
              bgColor='white'
              fontSize={24}
              value={inputAddress}
            />
          </form>
        )}
        {userAddress ? (
          <>
            <Flex gap={20}>
              <Button
                fontSize={20}
                onClick={() => {
                  getNFTsForOwner(userAddress)
                }}
                mt={36}
                bgColor={'blue'}
                isLoading={isLoading}
                loadingText='Is fetching...'
              >
                Fetch NFTs
              </Button>
              <Button fontSize={20} onClick={handleReset} mt={36} bgColor='blue'>
                New Address
              </Button>
            </Flex>

            <Heading my={36}>Here are your NFTs:</Heading>

            {hasQueried ? (
              <SimpleGrid w={'90vw'} columns={4} spacing={24}>
                {
                  //@ts-ignore
                  results.ownedNfts.map(({ rawMetadata }, i) => {
                    if (!rawMetadata.attributes.length) return null
                    return (
                      <Flex flexDir={'column'} color='white' bg='blue' w={'20vw'} key={i}>
                        <Box>
                          {/**@ts-ignore*/}
                          <b>Name:</b> {rawMetadata.name?.length === 0 ? 'No Name' : rawMetadata.name}
                        </Box>
                        <Image
                          //@ts-ignore
                          src={rawMetadata?.image ?? 'https://via.placeholder.com/200'}
                          alt={'Image'}
                        />
                      </Flex>
                    )
                  })
                }
              </SimpleGrid>
            ) : (
              'Please make a query! The query may take a few seconds...'
            )}
          </>
        ) : (
          <Flex gap={20}>
            <Button fontSize={20} onClick={handleSearchAddress} mt={36} bgColor='blue'>
              Search this address
            </Button>
            <Button fontSize={20} onClick={connectwalletHandler} mt={36} bgColor='blue'>
              Connect my wallet
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

export default App
