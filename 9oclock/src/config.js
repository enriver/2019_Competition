import Firebase from 'firebase';
import * as c from './constant';

let config = {
    apiKey : c.FIREBASE_API_KEY,
    authDomain : c.FIREBASE_AUTH_DOMAIN,
    databaseURL : "https://oclock-27bcb.firebaseio.com",
    projectId: c.FIREBASE_PROJECT_ID,
    storageBucket: c.FIREBASE_STORAGE_BUCKET,
    messagingSenderId : c.FIREBASE_MESSAGING_SENDER_ID,  
    appId : c.FIREBASE_APP_ID, // appId 와 measurementId는 다른 코드에서는 사용되지 않았음. 
    measurementId : c.MEASUREMENT_ID,
};


export default class FirebaseSDK{
    constructor(){
        if(!Firebase.apps.length){
            // for avoiding re-initializing
            Firebase.initializeApp(config); 
        }
        
        this.roomKey = '';
    }


    login = async (user, success_callback, failed_callback) => {
		await Firebase
			.auth()
			.signInWithEmailAndPassword(user.email, user.password)
			.then(success_callback, failed_callback);
    };
    
    createAccount = async user => {
        Firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(
            function() {
                console.log(
                'created user successfully. User email:' +
                user.email +
                ' name:' +
                user.name
                );

                var userf = Firebase.auth().currentUser;

                userf.updateProfile({ displayName: user.name }).then(
                    function() {
                        console.log('Updated displayName successfully. name:' + user.name);
                        alert(
                            'User ' + user.name + ' was created successfully. Please login.'
                        );
                    },
                    function(error) {
                        console.warn('Error update displayName.');
                    }
                );
            },
            function(error) {
                //console.error를 사용하면 기능이 중단되고 다시 하도록 나온다. 
                //console.error('got error:' + typeof error + ' string:' + error.message);
                alert('Create account failed. Error: ' + error.message);
            }
        );
    };

    
    get refMessages(){
        return Firebase.database().ref('Rooms/' + this.roomKey + '/messages');
    }

    get refUid(){
        return (Firebase.auth().currentUser || {}).uid; 
    }

    get refUserName(){
        return Firebase.auth().currentUser.displayName;
    }

    refUser(userId){
        return Firebase.database().ref('Users/' + userId + '/_info');
    }

    refRoom(newRoomName){
        return Firebase.database().ref('Rooms/' + newRoomName);
    }

    refRoomKey = async (newRoomName) => {
        
        return new Promise(async function (resolve, rejects){
            console.log("refRoomKey 안으로 들어옴!")
            let SDK = new FirebaseSDK();
            let room_ref = Firebase.database().ref('Rooms/' + newRoomName);
            let key = await SDK.refRoomKey_sub(room_ref);
            
            console.log('key is this : ' + key);
            resolve(key);
        })        
    }

    refRoomKey_sub = (room_ref) =>{
        return new Promise(function (resolve, rejects){
            room_ref.on('value', (dataSnapshot) =>{
                let key = "";
                console.log("data : " + dataSnapshot);
                dataSnapshot.forEach((child) =>{                
                    if(child.val().isClosed === false){                         
                        key = child.key;                    
                    }                     
                });
                resolve(key)
            });
            
        })
    }

    setRoomKey = key => {
        this.roomKey = key;
    }

    refOff(){
        this.refMessages.off();
    }

    parse = message =>{
        const {user,text,timestamp} = message.val(); 
        //여기에 들어가는 user가 문제인듯
        const {key: _id}=message;
        const createdAt = new Date(timestamp);

        return{
            _id,
            createdAt,
            text,
            user
        };
    };

    get = callback =>{ //아 ... 말 그대로 콜백 값이 callback에 담기는거야...? 바인딩 플러스에???
        // callback은 말 그대로 인자값을 넣어주는 것 같은데,,, 잘 모르겠다. 
        
        this.refMessages.on("child_added", snapshot => callback(this.parse(snapshot)));
    };

    send = messages => {
        messages.forEach(item => {
            const message ={
                text: item.text,                
                timestamp : Firebase.database.ServerValue.TIMESTAMP,
                user: item.user
                //여기에 item.user._id가 없다는 것...? 
            };
            this.refMessages.push(message);
        });
    };


    createRoom = async (roomName) =>{
        return new Promise(async function( resolve, rejects){
            let room_ref = Firebase.database().ref('Rooms/' + roomName);        
            await room_ref.push( { 
                roomName : roomName, 
                createdAt : Date.now(),
                isClosed : false,
            } )
            resolve();
        })
        
    }
    enter =  (newRoomName, roomKey) =>{
        
        let user_ref = Firebase.database().ref('Users/' + this.refUid);
        let duplicated = false;
        user_ref.on('value', (dataSnapshot) =>{
            dataSnapshot.forEach( (child) =>{
                if(child.val().roomKey === roomKey){
                    //같은 게 있다면, 똑같은 방에 들어오게 된 것이므로 빽
                    duplicated = true; 
                }
            })
        })
        if(!duplicated){
            user_ref.push( {
                roomName : newRoomName,
                roomKey : roomKey 
            });
        }   
    }
    setUserInfo = (userId, name, bank, account) =>{
        let user_ref = this.refUser(userId);
        console.log("user ref : " + user_ref);
        user_ref.push({
            name : name,
            bank : bank,
            account : account,
        })
    }
}

export const app = Firebase.initializeApp(config);
export const db = app.database();


