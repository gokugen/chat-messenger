import React, { useState, useRef, useEffect } from "react"
import { StyleSheet, StatusBar, View, SafeAreaView, FlatList, Text, TouchableOpacity, Image, Alert, RefreshControl, Platform } from "react-native";
import "dayjs/locale/fr"
// @ts-ignore
import WS from "react-native-websocket"
import ActionSheet from "react-native-action-sheet";

// just fort test
let ls_nb: any = []

const Conversations = ({ route, navigation }: any) => {
  var my_id = Platform.OS === "ios" ? 1 : 2 // store.getId()
  const ws: any = useRef()

  // just for test
  function getRandomNumber() {
    var nb = Math.floor(Math.random() * 100000) + 1
    while (ls_nb.includes(nb))
      nb = Math.floor(Math.random() * 100000) + 1

    ls_nb.push(nb)
    return nb
  }

  const [conversations, setConversations] = useState([
    {
      _id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      pages: 1,
      users: [my_id, 2],
      messages: [
        {
          _id: getRandomNumber(),
          text: "Bonjour",
          createdAt: new Date("4/23/2021, 19:45").toISOString(),
          senderId: my_id,
          read: true,
        },
        {
          _id: getRandomNumber(),
          text: "Bonjour",
          createdAt: new Date("4/23/2021, 19:47").toISOString(),
          senderId: 2,
          read: true,
        },
        {
          _id: getRandomNumber(),
          text: "Comment vous allez ?",
          createdAt: new Date("4/23/2021, 19:50").toISOString(),
          senderId: 2,
        },
      ]
    },
    {
      _id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      pages: 1,
      users: [my_id, 3],
      messages: [
        {
          _id: getRandomNumber(),
          text: "J'ai une question",
          createdAt: new Date("4/10/2021, 19:45").toISOString(),
          senderId: my_id,
        },
        {
          _id: getRandomNumber(),
          text: "Oui je t'écoute",
          createdAt: new Date("4/10/2021, 19:47").toISOString(),
          senderId: 3,
        },
        {
          _id: getRandomNumber(),
          text: "Il faudrait qu'on s'organise une réunion ca sera plus simple je pense",
          createdAt: new Date("4/10/2021, 19:50").toISOString(),
          senderId: my_id,
          read: true
        },
      ]
    },
  ]);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ height: 30, width: 30, borderRadius: 40 / 2, backgroundColor: "transparent", marginRight: 5 }}
          onPress={() => {
            // api create conversation
            navigation.push("Chat", { conversation_id: "", correspondent: {}, messages: [] })
          }}>
          <Image
            style={{ height: 30, width: 30 }}
            source={{ uri: "https://cdn.icon-icons.com/icons2/1244/PNG/512/1492790881-6add_84227.png" }}
          />
        </TouchableOpacity>
      ),
    })

    // api.get_users_conversations(my_id).then(res => {
    //     setConversations(res.data)
    // }).catch(e => console.log(e))
  }, [])

  function handleLongPress(conversation_id: string) {
    const options = [
      "Supprimer",
      "Retour",
    ];

    const cancelButtonIndex = options.length - 1;
    ActionSheet.showActionSheetWithOptions({
      options,
      cancelButtonIndex,
    }, (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          showAlert(conversation_id);
          break;
      }
    });
  }

  function showAlert(conversation_id: string) {
    Alert.alert(
      "Etes-vous sûr ?",
      "",
      [
        { text: "Non", onPress: () => { }, style: "cancel" },
        {
          text: "Oui", onPress: () => {
            // api.remove_conversation(conversation_id).then(() => {
            setConversations(conversations.filter(c => c._id != conversation_id))
            // }).catch(e => console.log(e))
          }
        },
      ],
    )
  }

  function getFormatedDate(message_createdAt: string) {
    // @ts-ignore
    var minutes = Math.floor(Math.abs(new Date() - new Date(message_createdAt)) / 1000 / 60)
    var hours = Math.floor(minutes / 60)
    var days = Math.floor(hours / 24)

    if (minutes < 60)
      return minutes + "m" // Minutes
    else if (hours < 24)
      return Math.floor(hours) + "h" // Hours
    else if (days < 7)
      return days + "jours" // Days
    else if (days < 31) {
      var nb_weeks = Math.floor(days / 7)
      return nb_weeks + "semaine" + (nb_weeks > 1 ? "s" : "") // Days
    }
    else if (days > 31 && days < 365)
      return Math.floor(hours / 24 / 30) + "mois" // Months
    else
      return Math.floor(hours / 24 / 30 / 12) + "ans" // Years
  }

  function renderItem({ item }: any) {
    var bold = null
    var color = "grey"
    var last_message = item.messages[0] ? item.messages[item.messages.length - 1] : { read: "", text: "ok", user: {} }
    if (!last_message.read && last_message.senderId != my_id) {
      color = "white"
      bold = "bold"
    }

    const correspondentId = item.users.find((userId: any) => userId !== my_id)
    // const correspondent = await api.get_user(correspondentId)

    // test
    const correspondent = {
      _id: correspondentId,
      username: correspondentId === 2 ? "Chahin" : "Marc",
      avatar: correspondentId === 2 ? "https://cdn-icons-png.flaticon.com/512/147/147133.png" : "https://cdn-icons-png.flaticon.com/512/147/147144.png"
    }

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.push("Chat", { conversation_id: item._id, correspondent: correspondent, messages: item.messages })}
        onLongPress={() => handleLongPress(item._id)}
        delayLongPress={500}
        style={styles.item}>
        <View style={{ flex: 1, height: 40, width: 40, borderRadius: 40 / 2, backgroundColor: "transparent", marginBottom: 5, marginRight: 5 }}>
          <Image borderRadius={40} style={{ height: 40, width: 40 }} source={{ uri: correspondent.avatar }} />
        </View>
        <View style={{ flex: 10, marginLeft: 20 }}>
          {/* @ts-ignore */}
          <Text style={{ ...styles.title, color, fontWeight: bold }}>{correspondent.username}</Text>
          {/* @ts-ignore */}
          <Text style={{ ...styles.message, color, fontWeight: bold }}>{last_message.text.length > 30 ? last_message.text.substr(0, 30) + "..." : last_message.text}</Text>
        </View>
        <View style={{ flex: 4, alignItems: "flex-end" }}>
          {/* @ts-ignore */}
          <Text style={{ ...styles.message, color, marginLeft: 0, fontWeight: bold, fontStyle: "italic" }}>{getFormatedDate(last_message.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    )
  };

  // When the websocket send something
  function manageOperation(data: any) {
    // Update the concerned conversation
    // setConversations([...conversations.filter(conversation => conversation._id !== data.conversation_id), api.get_conversation(data.conversation_id)])
  }

  function onRefresh() {
    setRefreshing(true);
    // api.get_users_conversations(my_id).then(res => {
    // setConversations(res.data)
    // setRefreshing(false)
    // }).catch(e => console.log(e));
    setTimeout(() => {
      setRefreshing(false)
    }, 2000);
  }


  return (
    <SafeAreaView style={styles.container}>
      <WS ref={ws}
        url={"http://192.168.0.15:4000"}
        onOpen={() => {
          // send my database id
          ws.current?.send(JSON.stringify({ _id: my_id }))
        }}
        onMessage={(msg: any) => manageOperation(JSON.parse(msg.data))}
        onClose={() => console.log("ws closed conversation")}
      />

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()} />}
      />
    </SafeAreaView>
  )
}
export default Conversations

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    // backgroundColor: "#353434"
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E9",
    padding: 20,
    paddingRight: 10,
  },
  title: {
    marginLeft: 10,
    fontSize: 20,
  },
  message: {
    marginTop: 5,
    marginLeft: 10,
    fontSize: 15,
  }
})