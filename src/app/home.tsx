import { useEffect, useState } from "react"
import { View, Alert, Text } from "react-native"
import MapView, { Callout, Marker } from "react-native-maps"
import * as Location from "expo-location"
import { api } from "@/services/api"
import { colors, fontFamily } from "@/styles/theme"
import { Categories, CategoriesProps } from "@/components/categories"
import { PlaceProps } from "@/components/place"
import { Places } from "@/components/places"

type MarketProps = PlaceProps & {
  latitude: number,
  longitude: number
}

const currentLocation = {
  latitude: -23.561187293883442,
  longitude: -46.656451388116494,
  latitudeDelta: 0.01, 
  longitudeDelta: 0.01
}

export default function Home(){
  const [categories, setCategories] = useState<CategoriesProps>([])
  const [category, setCategory] = useState("")
  const [markets, setMarkets] = useState<MarketProps[]>([])

  const [regiao, setRegiao] = useState({
    latitude: -23.561187293883442,
    longitude: -46.656451388116494,
    latitudeDelta: 0.01, 
    longitudeDelta: 0.01
  })

  async function fetchCategories(){
    try {
      const { data } = await api.get("/categories")
      setCategories(data)
      setCategory(data[0].id)
    } catch (error) {
      console.log(error)
      Alert.alert("Categorias", "Não foi possível carregar as categorias.")
    }
  }

  async function fetchMarkets(){
    try {
      if(!category){
        return
      }

      const {data} = await api.get("/markets/category/" + category)
      setMarkets(data)
    } catch (error) {
      console.log(error)
      Alert.alert("Locais", "Não foi possível carregar os locais")
    }
  }

  async function getCurrentLocation(){
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync()

      if(granted){
        let meulocal = await Location.getCurrentPositionAsync()
        const { latitude, longitude } = meulocal.coords
        //console.log("latitude:" + latitude, "longitude:" + longitude)

        setRegiao({
          latitude: meulocal.coords.latitude,
          longitude: meulocal.coords.longitude,
          latitudeDelta: 0.1, 
          longitudeDelta: 0.1
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getCurrentLocation()
    fetchCategories()
  }, [regiao])

  useEffect(() => {
    fetchMarkets()
  }, [category])

  return (
    <View style={{ flex: 1, backgroundColor: "#CECECE" }}>
      <Categories data={categories} onSelect={setCategory} selected={category} />

      <MapView style={{ flex: 1 }} initialRegion={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }} region={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
        <Marker identifier="current" coordinate={{ latitude: regiao.latitude, longitude: regiao.longitude }} image={require("@/assets/location.png")} />
      </MapView>

      {markets.map(( item ) => (
          <Marker 
            key={item.id}
            identifier={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            image={require("@/assets/pin.png")}
          >
            <Callout>
              <View>
                <Text style={{ fontSize: 14, color: colors.gray[600], fontFamily: fontFamily.medium  }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: colors.gray[600], fontFamily: fontFamily.regular  }}>{item.address}</Text>
              </View>
            </Callout>
          </Marker>
        ))
      }

      <Places data={markets} />
    </View>
  )
}
/*
<MapView style={{ flex: 1 }} initialRegion={regiao} region={regiao}>
  <Marker identifier="current" coordinate={{ latitude: regiao.latitude, longitude: regiao.longitude }} image={require("@/assets/location.png")} />
</MapView>
*/