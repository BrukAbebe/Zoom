
const socket =io('/');
const myPeer = new Peer(undefined, {
    host: "/",
    port: "3000",
    path: "/peerjs",
});

let peers ={};
const videoGrid=document.getElementById('video-grid');
const myVideo= document.createElement('video');
myVideo.muted=true;



let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true,
}).then((stream) =>{
    myVideoStream=stream;
    addVideoStream(myVideo,stream);
    console.log(stream.getVideoTracks()[0].enabled);

    myPeer.on('call',(call) =>{
        call.answer(stream);
        const video =document.createElement('video');

        call.on('stream',(userVideoStream) =>{
            addVideoStream(video,userVideoStream);
        });

    });

    socket.on('user-connected',(userId) =>{
        connectToNewUser(userId,stream);
    });

    let text = $('#chat_message');
    console.log(text);

    $('html').keydown(function(e){
        console.log('Key pressed:', e.which);
        console.log('Input value:', text.val());
        if(e.which === 13 && text.val().length !== 0){
            socket.emit('message' , text.val());
            text.val('');
        }
    });
    socket.on('createMessage',(message) =>{
        $('ul').append(`<li class = "message"><b>User: <b><br>${message}<li>`);
        scrollToBottom();

    });

})


myPeer.on('open',(id) =>{
    socket.emit('join-room' ,ROOM_Id,id);
})

socket.on('user-disconnected',(userId) =>{
    if(peers[userId]){
        peers[userId].close();
    }
})


function addVideoStream(video,stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=> {
        video.play();
    })
    videoGrid.append(video);
}


function connectToNewUser(userId,stream){
    const call =myPeer.call(userId,stream)
    const video =document.createElement('video');

    call.on('stream',(userVideoStream) =>{
        addVideoStream(video,userVideoStream)
    });

    call.on('close' ,() =>{
        video.remove();
    })

    peers[userId]=call;
}


const scrollToBottom = () => {
    var d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
  }

const playStop = () =>{
    
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(myVideoStream.getVideoTracks());
    

    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled= false;
        setPlayVideo();
    }else{
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled=true;
    }

}

const muteUnmute = () =>{
    let enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled= false;
        setUnmuteButton();
    }else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled=true;
    }

}




const setPlayVideo = ()=>{
    const html =`
    <i class="fa-solid fa-video-slash"></i>
    <span>Play Video</span>`;

    document.querySelector('.main_Video_button').innerHTML=html;


} 

const setStopVideo =() =>{
    const html = ` 
    <i class="fa-solid fa-video"></i>
    <span>Stop Video</span>`;
    document.querySelector('.main_Video_button').innerHTML=html;
}

const setUnmuteButton =() =>{
    const html =`
    <i class="fa-solid fa-microphone-slash"></i>
      <span>UnMute</span>`;
      document.querySelector('.main_mute_button').innerHTML=html;

}

const setMuteButton = () =>{
    const html =`
    <i class="fa-solid fa-microphone"></i>
      <span>Mute</span>`;
      document.querySelector('.main_mute_button').innerHTML=html;
}