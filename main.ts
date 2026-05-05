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
const img_personRight = assets.image`myImage0`;
const img_playerFloat = assets.image`myImage1`;
const img_background = assets.image`myImage2`;
const img_hook = assets.image`myImage3`;
const img_blank = assets.image`myImage4`;

const text_thanks = ["Thank you so much!", "I am extremely grateful.", "I don't know what to say... Thanks!"]
const text_hint = ["I think there's a load-bearing lacrosse stick around here.", "I saw something swimming through the tennis balls... It was inhuman...", "So, like, why isn't there any glass around here?"];

//setup variables
let speed = 1;
let personSprites = [sprites.create(img_personLeft)];
personSprites.pop();
let numberSaved = 0;
let direction = 1; //0 = right, 1 = down, 2 = left, 3 = up, -1 = not moving

//setup sprites
let person = sprites.create(img_personLeft, SpriteKind.Enemy);
let hook = sprites.create(img_blank, SpriteKind.Projectile)

//setup scene
scene.setBackgroundImage(img_background);
let state = 0;

//setup player
let me = sprites.create(img_playerFloat, SpriteKind.Player);

game.onUpdate(() => {
    if (direction = 1) { //when pressing down
        scroll();
    }
    if (Math.random() < 0.01) {
        spawnPerson();
    }
});

function scroll() {
    for (let i = 0; i < sprites.allOfKind(SpriteKind.Enemy).length; i++) {
        sprites.allOfKind(SpriteKind.Enemy)[i].y-=speed;
    };
};

function spawnPerson() {
    personSprites.push(sprites.create(img_personLeft, SpriteKind.Enemy));
    let arrayEnd = personSprites.length - 1;
    if (Math.random() < 0.5) {
        personSprites[arrayEnd].setPosition((Math.random() + 0.2) * 40, 180);
    }
    else {
        personSprites[arrayEnd].setPosition(160 - (Math.random() + 0.2) * 40, 180)
        personSprites[arrayEnd].setImage(img_personRight);
    }
}

function savePerson(saved: Sprite) {
    saved.say("Wow, thank you for saving me!");
    let arrayPosition = personSprites.indexOf(saved);
    //How to remove a value of an array at a certain position?
    for (let i = 0; i < 120; i++) {
        saved.y--;
        pause(1)
    }
    saved.destroy();
    numberSaved++
}

function hookPerson() {
    hook.setImage(img_hook);
    hook.setPosition(me.x, me.y)
    let pointing = 1; //Direction would be negative if facing left
    let target = me; //shouldn't stay as me
    let found = false;
    for (let i = 0; i < 60; i++) {
        hook.x += pointing;
        for (let j = 0; j < sprites.allOfKind(SpriteKind.Enemy).length; j++) {
            let forSprite = sprites.allOfKind(SpriteKind.Enemy)[j];
            if (hook.overlapsWith(forSprite)) {
                target = forSprite;
                found = true;
            }
        }
        if (found) {
            break;
        }
        pause(1)
    }
    if (found == false) {
        return;
    }
    
    for (let i = 0; i < Math.abs(me.x-hook.x); i++) {
        hook.x -= pointing;
        target.x -= pointing;
        pause(1)
    }

    savePerson(target)
    hook.setImage(img_blank);
}

function dialogue(purpose: number) {
    return (text_thanks[Math.round(Math.random() * (text_thanks.length - 1))]);
    return ("ERROR!");
}