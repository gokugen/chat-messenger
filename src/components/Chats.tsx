import React, { useState, useRef, useEffect } from "react"
import { Platform, StyleSheet, View, Text, Alert, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { GiftedChat, InputToolbar, Send, Bubble, Time, MessageText } from "react-native-gifted-chat"
import Clipboard from "@react-native-clipboard/clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context"
import "dayjs/locale/fr"
// @ts-ignore
import WS from "react-native-websocket"

let next_page: number = 2

// just fort test
let ls_nb: any = []

const Chat = ({ dispatch, route, navigation }: any) => {
  var my_id = 1 // store.getId()
  const insets = useSafeAreaInsets();

  const ws: any = useRef()
  const chat: any = useRef()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<any>([])

  // just for test
  function getRandomNumber() {
    var nb = Math.floor(Math.random() * 100000) + 1
    while (ls_nb.includes(nb))
      nb = Math.floor(Math.random() * 100000) + 1

    ls_nb.push(nb)
    return nb
  }

  useEffect(() => {
    navigation.setOptions({
      title: route.params.correspondent.username || "Admin",
      headerBackTitle: "Retour",
      headerRight: () => (
        <TouchableOpacity
          style={{ height: 40, width: 40, borderRadius: 40 / 2, backgroundColor: "transparent", marginBottom: 5, marginRight: 5 }}
          onPress={() => { }}>
          <Image borderRadius={40} style={{ height: 40, width: 40 }} source={{ uri: route.params.correspondent.avatar }} />
        </TouchableOpacity>
      ),
    })

    const tmpMsg = route.params.messages.sort((a: any, b: any) => new Date(b.createdAt) > new Date(a.createdAt) ? 1 : -1)
    tmpMsg.forEach((msg: any) => msg.user = { _id: msg.senderId, avatar: msg.senderId === 2 ? "https://cdn-icons-png.flaticon.com/512/147/147133.png" : "https://cdn-icons-png.flaticon.com/512/147/147144.png" })
    setMessages(tmpMsg)
  }, [])

  function reachTheTop({ layoutMeasurement, contentOffset, contentSize }: any) {
    const paddingToTop = 80;
    return contentSize.height - layoutMeasurement.height - paddingToTop <= contentOffset.y;
  };

  // Load previous messages
  function loadPreviousMessages(e: any) {
    if (next_page < route.params.pages) {
      setIsLoading(true)

      // just for test
      // setTimeout(() => {
      //   setMessages([...messages, {
      //     _id: getRandomNumber(),
      //     text: "Wshaaaa",
      //     createdAt: new Date(),
      //     user: {
      //       _id: my_id
      //     },
      //     read: true,
      //   },
      //   {
      //     _id: getRandomNumber(),
      //     text: "Bienvenue chez auchan",
      //     createdAt: new Date(),
      //     user: {
      //       _id: 2,
      //       name: "Chahin",
      //       avatar: null,
      //     },
      //     read: true,
      //   },
      //   {
      //     _id: getRandomNumber(),
      //     text: "Ayayayaiiiii",
      //     createdAt: new Date(),
      //     user: {
      //       _id: 2,
      //       name: "Chahin",
      //       avatar: null,
      //     }
      //   }])
      //   setIsLoading(false)
      // }, 1000);

      // api.get_messages(conversation_id, next_page).then(res => {
      //     setMessages([...messages, ...res.data])
      //     next_page++
      // }).catch(e => console.log(e))
    }
  }

  function onSend(new_message: any) {
    // api.add_message(conversation_id, new_message).then(() => {
    // ws.current.send(JSON.stringify({ operation: "Add", message: new_message }))
    new_message[0]["senderId"] = new_message[0].user._id
    setMessages([...new_message, ...messages])
    // }).catch(e => console.log(e))
  }

  function handleLongPress(context: any, currentMessage: any) {
    const options = [
      "Copier",
      "Retour",
    ];
    if (currentMessage.senderId === my_id)
      options.splice(1, 0, "Supprimer")

    const cancelButtonIndex = options.length - 1;
    context.actionSheet().showActionSheetWithOptions({
      options,
      cancelButtonIndex,
    }, (buttonIndex: number) => {
      switch (buttonIndex) {
        case 0:
          Clipboard.setString(currentMessage.text);
          break;
        case 1:
          if (options.length !== 2)
            showAlert(currentMessage._id);
          break;
      }
    });
  }

  function showAlert(message_id: string) {
    Alert.alert(
      "Etes-vous sûr ?",
      "",
      [
        { text: "Non", onPress: () => { }, style: "cancel" },
        {
          text: "Oui", onPress: () => {
            // api.remove_message(conversation_id, message_id).then(() => {
            // ws.current?.send(JSON.stringify({ operation: "Remove", message_id }))
            setMessages(messages.filter((msg: any) => msg._id != message_id))
            // }).catch(e => console.log(e))
          }
        },
      ],
    )
  }

  // When the websocket send something
  function manageOperation(data: any) {
    // if (data.operation === "Send")
    //   api.send_notification(correspondent._id, { title: store.getUsername(), message: data.message }).catch((e: any) => console.log(e))
    // else if (data.operation !== "Remove") // Add and Modify
    //   setMessages([data.message, ...messages.filter((message: any) => message._id !== data.message._id)])
    // else // Remove
    //   setMessages(messages.filter((message: any) => message._id !== data.message_id))
  }

  // Read last messages that wasn't yet (when we open the conversation)
  function readLastMessages() {
    var i = 0
    while (i < messages.length && messages[i].senderId != my_id) {
      if (!messages[i].read) {
        messages[i]["read"] = true

        // api.modify_message(conversation_id, Messages[i]).then(() => {
        // ws.current.send(JSON.stringify({ operation: "Modify", message: messages[i] }))
        setMessages([messages[i], ...messages.filter((message: any) => message._id !== messages[i]._id)])

        // store.setNbNotifications(store.getNbNotifications() - 1)
        // dispatch({ type: "SET", value: store.getNbNotifications() })

        // }).catch(e => console.log(e))
      }
      i++
    }
  }

  return (
    <View style={styles.container}>
      <WS ref={ws}
        url={"http://192.168.0.15:4000"}
        onOpen={() => {
          // send my database id
          // ws.current.send(JSON.stringify({ conversation_id, correspondent._id, _id: my_id }))

          // read last messages sended by the other user
          readLastMessages()
        }}
        // onMessage={(msg: any) => manageOperation(JSON.parse(msg.data))}
        onClose={() => console.log("ws closed chat")}
      />

      <GiftedChat
        // main props
        ref={chat}
        placeholder={"Votre message..."}
        user={{ _id: 1 }}
        // @ts-ignore
        // renderAvatar={null}
        loadEarlier={true}
        messages={messages}
        onSend={new_message => onSend(new_message)}
        onLongPress={handleLongPress}
        minInputToolbarHeight={55}
        textInputProps={{
          value: null,
          autoFocus: true
        }}

        // custom render
        renderChatEmpty={() =>
          <View style={{ transform: [{ scaleY: -1 }], position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
            <View style={{ justifyContent: "center", alignItems: "center", margin: 40, paddingVertical: 30, paddingHorizontal: 15, borderRadius: 20, backgroundColor: "#E8E8E9" }}>
              <Text style={styles.text}>Vous avez une question urgente pour notre admin ?</Text>
              <Text></Text>
              <Text style={{ ...styles.text, fontWeight: undefined }}>Demandez ou indiquez un numéro de téléphone pour être contacter au plus vite.</Text>
              <Text></Text>
              <Text style={{ ...styles.text, fontWeight: undefined }}>Pour tout autre chose cette conversation fera l'affaire. N'oubliez pas les formules de politesse 😊</Text>
            </View>
          </View>
        }
        renderLoadEarlier={() => isLoading ? <ActivityIndicator /> : <></>}
        renderBubble={props => <Bubble {...props} touchableProps={{ delayLongPress: 500 }} textStyle={{ left: { color: "black" } }} wrapperStyle={{ left: { backgroundColor: "#E8E8E9" } }} />}
        renderTime={props => <Time {...props} timeTextStyle={{ left: { color: "black" } }} />}
        renderInputToolbar={props =>
          <InputToolbar {...props} containerStyle={{ alignContent: "center", justifyContent: "center", paddingTop: 6, marginBottom: 5, marginLeft: 10, marginRight: 10, borderRadius: 10, borderTopColor: "transparent", backgroundColor: "#E8E8E9" }} />
        }
        textInputStyle={{ color: "black" }}
        renderSend={props =>
          <Send {...props} containerStyle={{ marginRight: 10, marginLeft: 3, paddingBottom: 16 }}>
            <Text style={{ color: "dodgerblue", fontSize: 17, fontWeight: "bold" }}>{"Envoyez"}</Text>
          </Send>
        }
        renderMessageText={(props) => <MessageText {...props} optionTitles={["Appeler", "Texter", "Retour"]}></MessageText>}
        renderTicks={(currentMessage: any) => currentMessage.senderId === my_id && currentMessage.read ? <Text style={{ marginRight: 10, color: "white" }} >✓</Text> : <></>}

        // date and time
        locale={"fr"} // store.getLocale()}
        dateFormat={"DD/MM/YYYY"}

        // others
        // @ts-ignore
        bottomOffset={Platform.OS === "ios" && insets.bottom}
        keyboardShouldPersistTaps={"always"}
        listViewProps={{
          keyboardDismissMode: "on-drag",
          backgroundColor: "white",
          keyboardShouldPersistTaps: "true",
          onScroll: ({ nativeEvent }: any) => {
            if (reachTheTop(nativeEvent) && !isLoading) {
              loadPreviousMessages(true);
            }
          }
        }}
      />
    </View>
  )
}
export default Chat

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  text: {
    color: "black",
    fontWeight: "bold",
    fontSize: 17,
    textAlign: "center"
  }
})