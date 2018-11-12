# rotemath
I'd like to get ramped up on some modern front-end stuff for making a web version of Lightspeed. This should be fun as a learning exercise.

The schools around here don't teach mathematics by rote anymore. I'm no expert in children's education and I like a lot of what they're 
doing with algorithms and problem solving... but I can't quite accept my daughter not memorizing the times tables. So I told her
I'd give her fifty bucks (basically one million dollars, to a nine year-old) if she could memorize the tables up to 12. Hopefully this game will help her.

  * Version 1: (never checked in) The basic game in HTML and jQuery.
  * Version 2: Learned some TypeScript and rewrote in that, applying a bit of OO design.
  * Version 3: Removed jQuery dependency for vanillaJS. Wow, native browser API's work okay now!
  * Version 4: Added a settings/greeting page where you can configure the game, and some awful styling.
  * Version 5: Implemented the Materialize CSS library. More to do but it already looks a lot prettier!
  * Version 6: Added speech synthesis and recognition for supported browsers.

# notes about UI
At first I thought I'd have kids typing answers, but that's tedious. Turns out the times tables up to 12 only have 59 distinct answers. So let's make a ton of buttons! Much easier.

I also chose to highlight the buttons around the correct answer. The goal is not to count and calculate, but to memorize. I *want* to show them the right answer.

# next
  * See Issues for outstanding feature requests.
  * (done) I'd like to add a lot more game refinements: 
  * (done) I've read some teaching guides that recommend rearranging the problems a bit (e.g. 5 x _ = 20). Should be easy enough.
  * (done) Visual indicator of incorrect answers. Allow player to keep guessing after an incorrect guess until they get the right one (no score for that though.)
  * (done) No points for a correct answer after X seconds. Player should be memorizing, not working out the products.
  * (done) Practice modes for individual digits.
  * (done) Show players a chart of their weakest digits. Most incorrect answers / longest time. Maybe offer to practice on the weak parts specifically.
  * (done) Segregate into "levels" - maybe coloured belts like karate. Probably up to 3, 6, 9, 12. Completing the game at a selected level with a perfect score earns you the belt.
  * (done) Speech functions! The web speech API works in a few browsers. The game could read out the questions and accept spoken answers.
  
