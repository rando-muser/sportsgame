/**
 *     assets.image`myImageName`
 *     assets.tilemap`myTilemapName`
 *     assets.tile`myTileName`
 *     assets.animation`myAnimationName`
 *     assets.song`mySongName`
 * 
 * https://arcade.makecode.com/reference
 * 
 * Game plan:
 * 1. Show intro sequence
 * 2. Dive into pile of stuff
 * 3. Profit (find people)
 */

const img_personLeft = assets.image`myImage`;

let mySprite = sprites.create(img_personLeft, SpriteKind.Enemy);

game.onUpdate(() => {
    scroll();
});

function scroll() {
    mySprite.y++;
}
