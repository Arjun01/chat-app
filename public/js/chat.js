const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const senderTemplate = document.querySelector('#sender-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const senderLocationMessageTemplate = document.querySelector('#sender-location-message-template').innerHTML;
const notificationTemplate = document.querySelector('#notification-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} =Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild
    
    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
   //visible height
   const visibleHeight = $messages.offsetHeight 

   //Height of messages container
   const containerHeight = $messages.scrollHeight

   //How far have I scrolled?
   const scrollOffset = $messages.scrollTop + visibleHeight

   if(containerHeight - newMessageHeight <= scrollOffset){

    $messages.scrollTop = $messages.scrollHeight
   }
}

socket.on('notification',(notify)=>{
    console.log(notify);
    const html = Mustache.render(notificationTemplate,{
        notify
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('senderMessage', (message)=>{
    console.log(message);
    const html = Mustache.render(senderTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A | MMM D')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A | MMM D')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',(url)=>{
    console.log(url);
    const html = Mustache.render(locationMessageTemplate, {
        username:url.username,
        url:url.url,
        createdAt: moment(url.createdAt).format('h:mm A | MMM D')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('senderLocationMessage',(url)=>{
    console.log(url);
    const html = Mustache.render(senderLocationMessageTemplate, {
        username: url.username,
        url:url.url,
        createdAt: moment(url.createdAt).format('h:mm A | MMM D')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})


socket.on('roomData', ({room, users})=>{
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML=html;
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled');
  
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
       
        if(error){
            return console.log(error);
        }
        console.log('The message was delivered!')
    });
})

$sendLocationButton.addEventListener('click', () =>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.');
    }
    
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition( (position) =>{
        
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
         
            $sendLocationButton.removeAttribute('disabled');
                console.log('Location Shared!');
        });
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }
})