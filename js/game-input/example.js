var elListen    = document.getElementsByTagName('myGameContainer'),
    oGameInput  = new GameInput(elListen);
 
// in the main loop of your game
if (oGameInput.down(GameInput.CONST.ARROW_UP)) {
  // do stuff while user is holding up arrow
}
