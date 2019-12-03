import React, {Component} from "react";
import {Alert,View,Text, TouchableOpacity, StyleSheet,Platform, TextInput, Dimensions, Image, ScrollView} from "react-native";
import { Rating, AirbnbRating } from 'react-native-ratings';
import FirebaseSDK, { app } from "../config";

const firebase = new FirebaseSDK();

export default class Mainpage extends Component{
    
    constructor(props) {
      super(props);
      
      this.state = {
        trial : true, 
        userName : this.props.navigation.state.params.userName, 
        userRating : this.props.navigation.state.params.rating,
        count : this.props.navigation.state.params.count, 
      };
          
    }


    render(){
      
        return(

        <View style={styles.container}>        
        <View style={styles.container}>
          
           <View style={styles.titlecontainer}>
                <Text style={styles.title}>회원정보</Text>
           <TouchableOpacity 
           onPress = {() => this.props.navigation.navigate("AppMain")}>
          <Image source = {require('./x_button.png')} style = {styles.image}/>
       </TouchableOpacity>
       </View>          
          
       <ScrollView>
         <View style = {{alignItems:"center" , marginTop: 30 }}>
            <View style = {styles.circlename}>
                <Text style = {styles.username}>{this.state.userName}</Text>
            </View>
            <Rating
              type="custom"
              fractions={1} // 소수 점에 맞춰
              startingValue={this.state.userRating/this.state.count}
              showReadOnlyText = {false}
              readonly = {true}
              showRating
              imageSize={40}
              ratingTextColor="black"
              onFinishRating={this.ratingCompleted} 
              style={{ paddingVertical: 10 }}
            />
            
            </View>
            
            <View style={styles.subcontainer}>
            <Text> </Text>
              </View>
        <View style={styles.subcontainer}>
        <TouchableOpacity 
        onPress = {() => this.props.navigation.navigate("AppInfo")}>
          <Text style={styles.otherlink}>앱 정보</Text>
       </TouchableOpacity>
       </View>

       <View style={styles.subcontainer}>
       <TouchableOpacity 
       onPress = {this.onPwChange.bind()}>
          <Text style={styles.otherlink}>비밀번호 변경</Text>
       </TouchableOpacity>
       </View>

       <View style={styles.subcontainer}>
       <TouchableOpacity onPress = {this.onChangeAccountPress}>
          <Text style={styles.otherlink}>계좌번호 변경</Text>
       </TouchableOpacity>
       </View>

       <View style={styles.subcontainer}>
       <TouchableOpacity onPress={this.onLogoutPress.bind()}>
          <Text style={styles.otherlink}>로그아웃</Text>
       </TouchableOpacity>
       </View>

       <View style={styles.subcontainer}>
       <TouchableOpacity onPress={() => this.props.navigation.navigate("AccountDrop")}>
          <Text style={styles.otherlink}>회원 탈퇴</Text>
       </TouchableOpacity>
       </View>
      
       
       </ScrollView>
        </View>
        </View>
        
        );

    }

    onChangeAccountPress =() =>{

      firebase.refUser(firebase.refUid).once('value', (dataSnapshot)=>{
        this.props.navigation.navigate("ChangeAccount", {
          account  : dataSnapshot.val().account,
          bank : dataSnapshot.val().bank,
        });
      });
    }
    
    onLogoutPress=()=>{
      Alert.alert(
        '로그아웃',
        '접속중인 기기에서 로그아웃 하시겠습니까?',
        [{text: '로그아웃', 
          onPress: this.logout},
          {text: '취소',
           onPress: () => console.log('Cancel Pressed'),
           style: 'cancel'},
        ],
        {cancelable: false},
      );
    }
    logout=()=>{
      app.auth().signOut();
      console.log('로그아웃');
      this.props.navigation.navigate("LoginPage");
    }
    accountdrop(){
      
      Alert.alert(
        '회원 탈퇴',
        '정말로 탈퇴하시겠습니까?',
        [{text: '탈퇴하기', onPress:() => this.props.navigation.navigate("AppInfo").bind(this)},
          {text: '취소',
           onPress: () => console.log('Cancel Pressed'),
           style: 'cancel'},
        ],
        {cancelable: false},
      );
    }
    toAD(){
      
    }
    xbutton = () => {
      //페이지 이동 , 일단은 누르는 버튼으로 만들어 놨음.
      this.setState(prevState =>{ 
        return{
          trial : false,
        }
      }); 
    }
    onPwChange=()=>{
      this.props.navigation.navigate("ChangePw")
    }    
}

const styles = StyleSheet.create({
    
    container: {
        flex: 1,
      },
      info : {
        color : "black",
        fontSize : 20,
        fontWeight : "900",     
        alignSelf : "center"
      },
      otherpages : {
        alignSelf : "flex-start",
        marginHorizontal : 20,
        padding: 5,
        borderBottomColor:"#bbb",
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignSelf : "flex-start",
        justifyContent:"space-between",
        
      },
      subcontainer:{
        borderBottomColor:'#A9A9A9', 
        borderBottomWidth: 1,
        marginBottom:10, 
        marginHorizontal:10,
        paddingBottom:7,
        flexDirection:"row",
        flex: 1
        // borderWidth:1,
        // borderColor: "black"
      },
      otherlink : {
        fontSize : 15,
        marginLeft : 5,
        marginTop : 10,
        marginBottom : 10,
        flex : 1,
        flexDirection:"row",
        alignSelf:"flex-start"
      },      

      titlecontainer:{
        borderBottomColor:'#A9A9A9', 
        borderBottomWidth: 2,
        marginBottom:10, 
        marginHorizontal:10,
        paddingBottom:7,
        flexDirection:"row",
        // borderWidth:1,
        // borderColor: "black"
      },

      image : {        
        flex:1,
        alignSelf:"center",
        marginTop: 28,
        width : 60,
        height : 60,
        marginBottom: -10,
      },

      title : {
        color : "black",
        fontSize : 30,
        marginTop : 45,
        fontWeight : "900",
        marginBottom : 7,
        marginLeft:15,
        alignSelf : "flex-start",
        flex:1,
        marginBottom: 0
      },
      circlename:{
        alignItems : "center",
        justifyContent : "center",
        backgroundColor: "#a9a9a9",
        width : 120,
        height : 120,
        borderRadius : 150
      },
      username : {
        fontSize : 30,        
      },
      togglebtn:{
        flex:1,
        flexDirection:"row",
        alignSelf:"center",
        
      }
});