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

socket.on('notification',(notify)=>{
    console.log(notify);
    const html = Mustache.render(notificationTemplate,{
        notify
    });
    $messages.insertAdjacentHTML('beforeend',html);
})

socket.on('senderMessage', (message)=>{
    console.log(message);
    const html = Mustache.render(senderTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A | MMM D')
    });
    $messages.insertAdjacentHTML('beforeend',html);
})

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A | MMM D')
    });
    $messages.insertAdjacentHTML('beforeend',html);
})

socket.on('locationMessage',(url)=>{
    console.log(url);
    const html = Mustache.render(locationMessageTemplate, {
        url:url.url,
        createdAt: moment(url.createdAt).format('h:mm A | MMM D')
    })
    $messages.insertAdjacentHTML('beforeend',html);
})

socket.on('senderLocationMessage',(url)=>{
    console.log(url);
    const html = Mustache.render(senderLocationMessageTemplate, {
        url:url.url,
        createdAt: moment(url.createdAt).format('h:mm A | MMM D')
    })
    $messages.insertAdjacentHTML('beforeend',html);
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
