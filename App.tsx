import React, { useEffect, useRef } from "react"
import { StatusBar } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import Conversations from "./src/components/Conversations"
import Chat from "./src/components/Chats"

const Stack = createStackNavigator()

export default function App() {
  const navigationRef: any = useRef()

  useEffect(() => {
    StatusBar.setBarStyle("dark-content")
  }, [])

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName={"BottomBar"}>
        <Stack.Screen name="Conversations" component={Conversations} />
        <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
