# rotemath
I'd like to get ramped up on some modern front-end stuff for making a web version of Lightspeed. So as a learning exercise here's a 
learning exercise!

The schools around here don't teach mathematics by rote anymore. I'm no expert in children's education and I like a lot of what they're 
doing with algorithms and problem solving... but I can't quite deal with my daughter not memorizing the times tables. So I told her
I'd give her fifty bucks if she could memorize the tables up to 12, and this game will help her.

  * Version 1: (never checked in) The basic game in HTML and jQuery.
  * Version 2: Learned some TypeScript and rewrote in that, applying a bit of OO design.
  * Version 3: Added a settings/greeting page where youc an configure the game, and some awful styling.
  
# next
  * I'd like to do a much nicer interface using materialize css or similar.
  * The code should really be event driven. I think I can use Node's EventEmitter to have RoteMathWeb responding to events thrown by the 
  game object instead of checking conditions and calling all sorts of show/hide methods.
  * Writing this in a SPA framework would also take care of that.
  * Generate a score that includes time.
  * Show players a chart of their weakest digits. Most incorrect answers / longest time.
