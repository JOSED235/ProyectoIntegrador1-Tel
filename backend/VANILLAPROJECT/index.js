console.log("Hola mundo");

counterView = document.getElementById('counterView');
counterAction= document.getElementById('counterAction');

counter = 0;

counterAction.addEventListener(
    'click', ()=> {
        counter++;
        counterView.innerHTML = "" + counter;
    });
    