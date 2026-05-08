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

/**
 * current errors:
 * - how do I access the terminal
 * - hook keeps spawning after spamming left/right
 */

const img_personLeft = assets.image`myImage`;
const img_personRight = assets.image`myImage0`;
const img_playerFloat = assets.image`myImage1`;
const img_background = assets.image`myImage2`;
const img_hook = assets.image`myImage3`;
const img_oxygen = assets.image`myImage7`;
const img_blank = assets.image`myImage4`;
const img_openingPlayer = assets.image`myImage5`;
const img_openingBackground = assets.image`myImage6`;
const img_bubble1 = assets.image`myImage8`;

const tile_enter = assets.tile`myTile6`;

const tilemap_homebase = assets.tilemap`level`;
const tilemap_blank = assets.tilemap`level2`;

const imgList_items = [img_hook, img_oxygen];
const bubbleSprites = [img_bubble1];

const text_thanks = ["Thank you so much!", "I am extremely grateful.", "I don't know what to say... Thanks!"];
const text_hint = ["I think there's a load-bearing lacrosse stick around here.", "I saw something swimming through the tennis balls... It was inhuman...", "So, like, why isn't there any glass around here?"];

const chance = [0.005, 0.01];
//------spawn:--person--item--

//setup variables
let personSprites = [sprites.create(img_blank)];
let itemSprites = [sprites.create(img_blank)];
let effectSprites = [sprites.create(img_blank)];
let inventoryNames = ["Hooks"];
let itemAmounts = [3, 1];
let inventory = [2, 0];
personSprites[0].destroy();
itemSprites[0].destroy();
effectSprites[0].destroy();
personSprites.pop();
itemSprites.pop();
effectSprites.pop();
let numberSaved = 0;
let direction = -1; //0 = right, 1 = down, 2 = left, 3 = up, -1 = not moving
let state = -1; //for opening
let usingHook = false;

//setup sprites
//player = player sprite, enemy = person, food = item, projectile = no kind
let hook = sprites.create(img_blank, SpriteKind.Projectile);
let bg = sprites.create(img_blank, SpriteKind.Projectile);
let me = sprites.create(img_blank, SpriteKind.Player);

//----- OPENING -----
bg.setImage(img_openingBackground);
me.setImage(img_openingPlayer);
bg.setPosition(100, 60);
me.setPosition(0, 90);
for (let i = 0; i < 30; i++) {
    bg.x--;
    me.x++;
    pause(4*i);
}
controller.pauseUntilAnyButtonIsPressed();
bg.destroy();
info.setScore(0);

//setup scene
function changeStateTo(target: number) {
    if (target == 0) {
        clear(personSprites);
        clear(itemSprites);
        state = 0;
        scene.setBackgroundImage(img_background);
        scene.setBackgroundColor(15);
        info.setLife(10 * 10);
        scene.setTileMapLevel(tilemap_blank);
        me.setImage(img_playerFloat);
        me.setPosition(80, 60); 
        controller.moveSprite(me, 0, 0);
        me.ay = 0;
        me.vy = 0;
        inventory[0] = 2;
    }
    else if (target == 1) {
        clear(personSprites);
        clear(itemSprites);
        state = 1;
        scene.setBackgroundImage(img_blank);
        scene.setBackgroundColor(10);
        info.setLife(1);
        scene.setTileMapLevel(tilemap_homebase);
        me.setImage(img_playerFloat);
        me.setPosition(100, 60); 
        controller.moveSprite(me, 50, 0);
        me.ay = 100;
    }
}

//Settings/save data
/* 
    to save:
    # people saved (score)
*/

if (settings.exists("score") == false) {
    settings.writeNumber("score", 0);
}
settings.writeNumber("score", settings.readNumber("score"));

//START GAME
changeStateTo(1);

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    direction = 1;
})

controller.down.onEvent(ControllerButtonEvent.Released, function () {
    direction = -1;
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    direction = -1;
    if (usingHook == false && state == 0) {
        if (inventory[0] > 0) {
            hookPerson(0);
        }
        else {
            me.say("I'm out of hooks!", 300);
        }
    }
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    direction = -1;
    if (usingHook == false && state == 0) {
        if (inventory[0] > 0) {
            hookPerson(2);
        }
        else {
            me.say("I'm out of hooks!", 300);
        }
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    direction = 3;
    if (state == 1 && me.isHittingTile(CollisionDirection.Bottom)) {
        me.vy = -100;
    }
})

controller.up.onEvent(ControllerButtonEvent.Released, function () {
    direction = -1;
})

controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (state == 0) {
        saveData();
        changeStateTo(1);
    }
})

scene.onOverlapTile(SpriteKind.Player, tile_enter, () => {
    if (state == 1) {
        changeStateTo(0);
    }
});

//ON GAME UPDATE

game.onUpdate(() => {
    if (state == 0) {
        if (direction == 1) { //when pressing down
            scroll(1);
            swimEffect(0.2);
            breathe(0.1);
            if (Math.random() < chance[0]) {
                spawnPerson();
            }
            else if (Math.random() < chance[1]) {
                spawnItem(-1);
            }
        }
        else if (direction == -1) { //not moving
            scroll(0.25);
            breathe(0.02);
        }
        else {
            breathe(0.05)
            scene.cameraShake(2, 50)
        }
    }
});

function scroll(speed: number) {
    for (let i = 0; i < sprites.allOfKind(SpriteKind.Enemy).length; i++) {
        let tempSprite = sprites.allOfKind(SpriteKind.Enemy)[i];
        tempSprite.y -= speed;
        if (tempSprite.y < -50) { //remove far away sprites
            tempSprite.destroy();
            removeAt(personSprites, i);
        }
    };
    for (let i = 0; i < sprites.allOfKind(SpriteKind.Food).length; i++) {
        let tempSprite = sprites.allOfKind(SpriteKind.Food)[i];
        tempSprite.y -= speed;
        if (tempSprite.y < -50) { //remove far away sprites
            tempSprite.destroy();
            removeAt(itemSprites, i);
        }
    }
};

function breathe(speed: number) {
    if (Math.random() < speed) {
        info.changeLifeBy(-1);
    }
}

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

function spawnItem(id: number) {
    itemSprites.push(sprites.create(img_blank, SpriteKind.Food));
    let arrayEnd = itemSprites.length - 1;
    itemSprites[arrayEnd].setPosition(Math.random() * 160, 180)
    if (id > -1) {
        itemSprites[arrayEnd].setImage(imgList_items[id])
    }
    else {
        itemSprites[arrayEnd].setImage(randomEntry(imgList_items))
    }
}

function savePerson(saved: Sprite) {
    saved.say("Wow, thank you for saving me!");
    let arrayPosition = personSprites.indexOf(saved);
    removeAt(personSprites, arrayPosition);
    for (let i = 0; i < 120; i++) {
        saved.y--;
        pause(1)
    }
    saved.destroy();
    numberSaved++;
    info.changeScoreBy(1);
}

function getItem(item: Sprite) {
    let arrayPosition = itemSprites.indexOf(item);
    item.destroy();
    removeAt(itemSprites, arrayPosition);
    let tempNumber = imgList_items.indexOf(item.image);
    if (tempNumber < 1) {
        inventory[tempNumber] += itemAmounts[tempNumber];
    }
    else {
        if (tempNumber == 1) {
            info.changeLifeBy(20)
        }
    }
}

function hookPerson(dir: number) {
    inventory[0]--;
    usingHook = true;
    hook.setImage(img_hook);
    hook.setPosition(me.x, me.y)
    let pointing = -1 * dir + 1; //right = 0 * -1 = 0 + 1 = 1; left = 2 * -1 = -2 + 1 = -1;
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
        for (let j = 0; j < sprites.allOfKind(SpriteKind.Food).length; j++) {
            let forSprite = sprites.allOfKind(SpriteKind.Food)[j];
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
        hook.setImage(img_blank);
        usingHook = false;
        return;
    }
    
    for (let i = 0; i < Math.abs(me.x-hook.x); i++) {
        hook.x -= pointing;
        target.x -= pointing;
        pause(1)
    }

    hook.setImage(img_blank);
    usingHook = false;

    if (target.kind() == SpriteKind.Enemy) {
        savePerson(target);
    }
    else if (target.kind() == SpriteKind.Food) {
        getItem(target);
    }
}

function dialogue(purpose: number) {
    return (text_thanks[Math.round(Math.random() * (text_thanks.length - 1))]);
    return ("ERROR!");
}

function removeAt(array: any[], pos: number) {
    let tempArray = [];
    for (let i = 0; i < pos; i++) {
        tempArray.push(array[i]);
    }
    for (let i = pos + 1; i < array.length; i++) {
        tempArray.push(array[i]);
    }
    if (tempArray.length != array.length - 1) {
        console.log("ERROR in the 'RemoveAt' function: Incorrect length output")
    }
    else {
        console.log("RemoveAt succeeded.")
    }
    return (tempArray);
}

function randomEntry(array: any[]) {
    return (array[Math.round(Math.random() * (array.length - 1))]);
}

function clear(array: any[]) {
    for (let i = 0; i < array.length; i++) {
        array[i].destroy()
    }
    array = [];
}

function saveData() {
    settings.writeNumber("score", info.score());
}

game.onGameOver(() => {
    changeStateTo(1);
    saveData();
})

function swimEffect(intensity: number) {
    if (Math.random() < intensity) {
        effectSprites.push(sprites.create(bubbleSprites[Math.round(Math.random()*(bubbleSprites.length-1))], SpriteKind.Projectile));
        let tempSprite = effectSprites[effectSprites.length - 1];
        tempSprite.setPosition(me.x, me.y + 20);
        tempSprite.vy = (Math.random() - 0) * -100
        if (Math.random() < 0.5) {
            tempSprite.vx = (Math.random() + 1) * -20;
            tempSprite.x -= 6;
        }
        else {
            tempSprite.vx = (Math.random() + 1) * 20;
            tempSprite.x += 6;
        }
        timer.after(500, () => {
            removeAt(effectSprites, effectSprites.indexOf(tempSprite))
            tempSprite.destroy();
        })
    }
}