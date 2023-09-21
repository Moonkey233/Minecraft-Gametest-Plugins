import { world, Commands, Player } from 'mojang-minecraft';  //导入接口模块

const operatorList = ["Moonkey2519", "Moonkey233"];   //op list

var chatRecord = ""    //初始化聊天记录

var timeCount = 0;

world.events.beforeChat.subscribe((event) => {  //订阅beforeChat事件
    timeSet();
    var message = event.message;    //发送消息副本
    var player = event.sender;    //发送者副本

    chatRecord = chatRecord.concat(`§b${player.name}:`).concat(`§e${message}\n`);

    if (/%/.test(message) == true) {    //正则表达式匹配格式化代码%
        message = formatMessage(message, player);
    }

    if (message[0] == '_') {    //检测“_”前缀
        event.cancel = true;    //命令取消发送
        runCmd(message, player);
    }
 
    if (isTag(player.name,"mute") && message[0] != '_') {
        event.cancel = true;
        sendText("§b§l>>§c您处于禁言状态!", player.name);
    }

    event.message = message;
})

world.events.tick.subscribe((event) => {    //tick事件
    //say("test");
    world.getDimension("overworld").runCommand("say test");
    var players = world.getPlayers();

    if(timeCount++ % 100 == 0){
        //timeSet();
        timeCount = 0;
    }

    for (let i = 0; i < players.length; i++) {
        if (players[i].isSneaking) {
            addTag(players[i].name,"sneak");
        } else {
            removeTag(players[i].name,"sneak");
        }

        if (isTag(players[i].name,"getPos")){
            let pos = getPos(players[i]);
            run(`scoreboard players set @a[name=${players[i].name}] xPos ${pos.x}`);
            run(`scoreboard players set @a[name=${players[i].name}] yPos ${pos.y}`);
            run(`scoreboard players set @a[name=${players[i].name}] zPos ${pos.z}`);
            removeTag(players[i].name,"getPos");
        }

        if (isScore(players[i].name, "tprequest", 0)) {
            let list = getTag(players[i].name);
            if (list == null){
                list = [];
            }
            for (let j = 0; j < list.length; j++) {
                if (/tpa_/.test(list[j]) || /tpahere_/.test(list[j])) {
                    removeTag(players[i].name, list[j]);
                    setScore(players[i].name, "tprequest",-1);
                    sendText("§l§b>>§c请求超时,已取消",players[i].name);
                    if (/tpa_/.test(list[j])) {
                        sendText("§l§b>>§c请求超时,已取消",list[j].replace("tpa_",""));
                    } else {
                        sendText("§l§b>>§c请求超时,已取消",list[j].replace("tpahere_",""));
                    }
                }
            }
        }
    }

    for (let i = 0; i < main.length; i++) {
        run(main[i]);
    }
})

function formatMessage(message, player) {   //格式化代码
    player = getPos(player);
    message = message.replace("%pos", `§r(§e${player.x},${player.y},${player.z}§r)`);
    message = message.replace("%p", `§r(§e${player.x},${player.y},${player.z}§r)`);
    message = message.replace("%health", `§r§e${player.getComponent('health').current}§r`);
    message = message.replace("%h", `§r§e${player.getComponent('health').current}§r`);
    message = message.replace("%velocity", `§r(§e${player.velocity.x.toFixed(2)},${(player.velocity.y + 0.0785).toFixed(2)},${player.velocity.z.toFixed(2)}§r)`);
    message = message.replace("%v", `§r(§e${player.velocity.x.toFixed(2)},${(player.velocity.y + 0.0785).toFixed(2)},${player.velocity.z.toFixed(2)}§r)`);
    //message = message.replace("%rot",`§r(§e${player.pitch},${player.yaw}§r)`);
    return message;
}

function getPos(entity) {   //获取坐标  
    if (entity.location.x >= 0)
        entity.x = parseInt(entity.location.x);
    else
        entity.x = parseInt(entity.location.x) - 1;

    entity.y = parseInt(entity.location.y - 0.62);

    if (entity.location.z >= 0)
        entity.z = parseInt(entity.location.z);
    else
        entity.z = parseInt(entity.location.z) - 1;
    return entity;
}

function runCmd(cmd, executor) {    //命令判定执行
    var arg = cmd.split(" ")
    arg[0] = arg[0].toLowerCase();
    var name = executor.nameTag;   //name副本
    var args = []
    for(let i = 0,j = 0;i < arg.length; i++) {
        if (arg[i] != "") {
            args[j] = arg[i];
            j++;
        }
    }
    if (args[0] == "_timeset") {
        if (args.length == 1) {
            timeSet();
            sendText(`§b§l>>§eTime set!`, name)
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_sethome") {
        if (args.length == 2) {
            setHome(args[1],executor);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_removehome") {
        if (args.length == 2) {
            removeHome(args[1],name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_homelist") {
        if (args.length == 1) {
            homeList(name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_tp") {
        if (args.length == 2) {
            tp(args[1], name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_yes") {
        if (args.length == 1) {
            accept(name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_no") {
        if (args.length == 1) {
            reject(name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_getpos") {
        if (args.length == 1) {
            setScore(name, "xPos", getPos(executor).x);
            setScore(name, "yPos", getPos(executor).y);
            setScore(name, "zPos", getPos(executor).z);
            sendText(`§b§l>>§ePos saved!`,name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_survival") {
        if (args.length == 1) {
            run(`gamemode 0 @a[name=${name}]`);
            sendText(`§b§l>>§a已设置为生存模式`,name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_spawnpoint") {
        if (args.length == 1) {
            if (isSurvival(name) || isCreative(name)){
                run(`spawnpoint @a[name=${name}] ${getPos(executor).x} ${getPos(executor).y} ${getPos(executor).z}`);
                sendText(`§b§l>>§a成功设置重生点`,name);
            } else {
                sendText(`§b§l>>§c冒险模式下不可设置重生点`,name);
            }
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_tpa") {
        if (args.length == 2) {
            tpa(args[1], name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_tpahere") {
        if (args.length == 2) {
            tpahere(args[1], name);
        } else {
            sendText("§b§l>>§c语法错误,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_chat") {
        if (args.length == 1 && isOP(name)) {
            chat(name);
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_chatreset") {
        if(isOP(name) && args.length == 1) {
            chatRecord = "";
            sendText("§b§l>>§eChat reset!");
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_help") {
        if (args.length == 1) {
            sendText("§e<>为必选参数,[]为可选参数,PERMISSION为最低执行要求权限等级", name);
            help("all",name);
        } else if (args.length == 2) {
            sendText("§e<>为必选参数,[]为可选参数,PERMISSION为最低执行要求权限等级", name);
            help(args[1],name);
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_set") {
        if (args.length == 3) {
            set(name, args[1], args[2]);
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_fill") {
        if ((args.length == 9 || args.length == 8) && isOP(name)) {
            args[8] = args.length == 9 ? args[8] : 0
            fill(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], name);
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_mute") {
        if ((args.length == 3 || args.length == 2)  && isOP(name)) {
            args[2] = (args.length == 3) ? args[2] : 10;
            mute(args[1], args[2], name);
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_unmute") {
        if (args.length == 2 && isOP(name)) {
            unmute(args[1], name);
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_broadcast") {
        if (args.length == 2 && isOP(name)) {
            broadcast(args[1])
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_give") {
        if (args.length == 1 && isOP(name)) {
            give(name);
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助", name);
        }
    } else if (args[0] == "_init") {
        if (args.length == 1 && isOP(name)) {
            for (let i = 0; i <init.length; i++) {
                run(init[i]);
            }
        } else {
            sendText("§b§l>>§c语法错误或您的权限不足,输入_help以获取帮助",name );
        }
    }
    
    else{
        sendErr(cmd.replace("_", ""), name);
    }
}

function sendText(text, target = "@a") {   //tellraw文本
    run(`tellraw ${target} { "rawtext": [ { "text": "${text}" } ] }`)
}

function isOP(player) {    //判断执行者是否为op
    if (operatorList.includes(player))
        return true;
    else
        return false;
}

function timeSet() {    //时间校准模块
    let time = new Date();
    run(`scoreboard players set @e[type=armor_stand,tag=time] year ${time.getFullYear()}`);
    run(`scoreboard players set @e[type=armor_stand,tag=time] month ${time.getMonth() + 1}`);
    run(`scoreboard players set @e[type=armor_stand,tag=time] date ${time.getDate()}`);
    run(`scoreboard players set @e[type=armor_stand,tag=time] hour ${time.getUTCHours() + 8}`);
    run(`scoreboard players set @e[type=armor_stand,tag=time] minute ${time.getMinutes()}`);
    run(`scoreboard players set @e[type=armor_stand,tag=time] second ${time.getSeconds()}`);
    run(`scoreboard players set @e[type=armor_stand,tag=time] timeCount 0`);
}

function setHome(name, player) {    //设置家
    let home = getTag(player.name);
    if (home == null){
        home = [];
    }
    let homelist = [' ',' ',' '];
    let count = 0;
    for (let i = 0; i < home.length; i++) {
        if (/h0_/.test(home[i]) == true) {
            homelist[0] = home[i].replace("h0_","");
            count++;
        } else if (/h1_/.test(home[i]) == true) {
            homelist[1] = home[i].replace("h1_","");
            count++;
        } else if (/h2_/.test(home[i]) == true) {
            homelist[2] = home[i].replace("h2_","");
            count++;
        }
    }
    if(!isTag(player.name, "vip") && count >= 1) {
        sendText("§b§l>>§r§c你已达到普通用户传送点数量最大值§a§l1§r§c,请先使用_removehome <name:str>删除其他传送点,输入_homelist查询所有传送点",player.name);
    } else if (isTag(player.name,"vip") && count >= 3) {
        sendText("§b§l>>§r§c你已达到vip用户传送点数量最大值§l§a3§r§c,请先使用_removehome <name:str>删除其他传送点,输入_homelist查询所有传送点",player.name);
    } else {
        for (let i = 0; i < 3; i++) {
            if (homelist[i] == ' ') {
                if (/_/.test(name) == true || / /.test(name) == true) {
                    sendText("§b§l>>§c传送点名中不可包含字符'_'以及空格",player.name);
                    break;
                } else {
                    if(name.length > 10) {
                        sendText("§b§l>>§cname太长了,它最长应为10个字符",player.name);
                        break;
                    } else {
                        if (isSurvival(player.name) || isCreative(player.name)) {
                            var flag = false;
                            for (let j = 0; j < 3; j++) {
                                if (homelist[j] == name){
                                    flag = true;
                                }
                            }
                            if (flag) {
                                sendText('§b§l>>§c传送点命名重复,输入_homelist查询所有传送点',player.name);
                                break;
                            }
                            let tagName = `h${i}_`;
                            tagName = tagName.concat(name);
                            addTag(player.name, tagName);
                            let pos = getPos(player);
                            setScore(player.name, `home${i}x`,pos.x);
                            setScore(player.name, `home${i}y`,pos.y);
                            setScore(player.name, `home${i}z`,pos.z);
                            sendText(`§b§l>>§e§l ${name} §r§a已成功添加到您的传送点列表,当前传送点数量§e§l${count+1}`,player.name);
                            break;
                        } else {
                            sendText("§b§l>>§c您不能在冒险模式下设置传送点",player.name);
                            break;
                        }
                    }
                }
            }
        }
    }
}

function removeHome(name, player) {    //移除家
    let home = getTag(player);
    if (home == null){
        home = [];
    }
    let homelist = [' ',' ',' '];
    let count = 0;
    for (let i = 0; i < home.length; i++) {
        if (/h0_/.test(home[i]) == true) {
            homelist[0] = home[i].replace("h0_","");
            count++;
        } else if (/h1_/.test(home[i]) == true) {
            homelist[1] = home[i].replace("h1_","");
            count++;
        } else if (/h2_/.test(home[i]) == true) {
            homelist[2] = home[i].replace("h2_","");
            count++;
        }
    }
    var sign = true;
    for (let i = 0; i < 3; i++) {
        if (homelist[i] == name) {
            removeTag(player,`h${i}_${name}`);
            sendText(`§b§l>>§r§a已移除传送点§e§l ${name} §r§a,当前传送点数量:§l§e${count-1}`,player);
            sign = false;
            break;
        }
    }
    if(sign) {
        sendText(`§b§l>>§r§c未在您的列表找到传送点§a§l ${name} §r§c,输入_homelist查询所有传送点`,player);
    }
}

function homeList(player){    //查询所有家
    let home = getTag(player);
    if (home == null){
        home = [];
    }
    let homelist = [' ',' ',' '];
    let count = 0;
    for (let i = 0; i < home.length; i++) {
        if (/h0_/.test(home[i]) == true) {
            homelist[0] = home[i].replace("h0_","");
            count++;
        } else if (/h1_/.test(home[i]) == true) {
            homelist[1] = home[i].replace("h1_","");
            count++;
        } else if (/h2_/.test(home[i]) == true) {
            homelist[2] = home[i].replace("h2_","");
            count++;
        }
    }
    let list = [];
    for (let i = 0, j = 0; i < 3; i++) {
        if (homelist[i] != ' ') {
            list[j] = homelist[i];
            j++;
        }
    }
    if (count != 0) {
        sendText(`§b§l>>§r§b在您的列表找到了§e§l ${count} §r§b个传送点: §e§l${list}`,player);
    } else {
        sendText(`§b§l>>§c未在您的列表找到传送点`,player);
    }
}

function tp(name, player) {    //传送家
    let home = getTag(player);
    if (home == null){
        home = [];
    }
    let homelist = [' ',' ',' '];
    for (let i = 0; i < home.length; i++) {
        if (/h0_/.test(home[i]) == true) {
            homelist[0] = home[i].replace("h0_","");
        } else if (/h1_/.test(home[i]) == true) {
                homelist[1] = home[i].replace("h1_","");
        } else if (/h2_/.test(home[i]) == true) {
                homelist[2] = home[i].replace("h2_","");
        }
    }
    if (homelist.includes(name)) {
        for (let i = 0; i < 3; i++) {
            if (homelist[i] == name) {
                if(!isTag(player, "vip") && (i == 1 || i == 2)){
                    sendText(`§b§l>>§r§c您不是vip用户,仅可使用默认传送点§a§l ${homelist[0]} §r§c,不可使用额外传送点§a§l ${homelist[i]}`,player);
                } else {
                    var posx = getScore(player,`home${i}x`);
                    var posy = getScore(player,`home${i}y`);
                    var posz = getScore(player,`home${i}z`);
                    run(`tp @a[name=${player}] ${posx} ${posy} ${posz}`);
                    sendText(`§l§b>>§a传送成功`,player);
                }
            }
        }
    } else {
        switch(name){
            case "maincity":
                run(`tp @a[name=${player}] 800 100 1000`);
                sendText(`§l§b>>§a传送成功`,player);
                break;
            case "主城":
                run(`tp @a[name=${player}] 800 100 1000`);
                sendText(`§l§b>>§a传送成功`,player);
                break;
            case "shop":
                run(`tp @a[name=${player}] 800 100 1000`);
                sendText(`§l§b>>§a传送成功`,player);
                break;
            case "商店":
                run(`tp @a[name=${player}] 800 100 1000`);
                sendText(`§l§b>>§a传送成功`,player);
                break;        
            default:
                sendText(`§l§b>>§r§c未找到传送点§a§l ${name}`,player);
                break;
        }
    }
}

function tpa(target, executor) {    //请求发起tpa
    if (isCreative(executor) || isSurvival(executor)) {
        if (isPlayer(target)) {
            if (isCreative(target) || isSurvival(target)) {
                sendText(`§b§l>>§r§b玩家§l§e ${executor} §r§b请求§e传送到你的位置§b,同意请输入§d_yes§b,拒绝请输入§d_no§b,30秒未回应自动拒绝`,target);
                addTag(target,`tpa_`.concat(executor));
                setScore(target,"tprequest",600);
                sendText("§b§l>>§a已发送请求,请等待回应...",executor);
            } else {
                sendText("§b§l>>§c目标玩家处于冒险模式,禁止使用该命令",executor);
            }
        } else {
            sendText(`§b§l>>§c未在世界中找到玩家§e§l ${target}`,executor);
        }
    } else {
        sendText("§b§l>>§c禁止在冒险模式下使用该命令",executor);
    }
}

function tpahere(target, executor) {    //请求发起tpahere
    if (isCreative(executor) || isSurvival(executor)) {
        if (isPlayer(target)) {
            if (isCreative(target) || isSurvival(target)) {
                sendText(`§b§l>>§r§b玩家§r§l§e ${executor} §r§b请求§e你传送到他的位置§b,同意请输入§d_yes§b,拒绝请输入§d_no§b,30秒未回应自动拒绝`,target);
                addTag(target,`tpahere_`.concat(executor));
                setScore(target,"tprequest",600);
                sendText("§b§l>>§a已发送请求,请等待回应...",executor);
            } else {
                sendText("§b§l>>§c目标玩家处于冒险模式,禁止使用该命令",executor);
            }
        } else {
            sendText(`§b§l>>§r§c未在世界中找到玩家§l§e ${target}`,executor);
        }
    } else {
        sendText("§b§l>>§c禁止在冒险模式下使用该命令",executor);
    }
}

function accept(player) {   //接受传送请求
    let list = getTag(player);
    if (list == null){
        list = [];
    }
    let executor = "";
    let accept = false;
    for (let i = 0; i < list.length; i++) {
        if (/tpa_/.test(list[i]) == true) {
            executor = list[i].replace("tpa_","");
            if(isPlayer(executor)){
                sendText(`§b§l>>§r§a玩家§l§e ${player} §r§a接受了你的传送请求`,executor);
                sendText("§b§l>>§a接受成功",player);
                removeTag(player,list[i]);
                run(`tp ${executor} ${player}`);
                setScore(player,"tprequest",-1);
                accept = true;
                break;
            }
        }
        if (/tpahere_/.test(list[i]) == true) {
            executor = list[i].replace("tpahere_","");
            if(isPlayer(executor)){
                sendText(`§b§l>>§r§a玩家§l§e ${player} §r§a接受了你的传送请求`,executor);
                sendText("§b§l>>§a传送成功",player);
                removeTag(player,list[i]);
                run(`tp ${player} ${executor}`);
                setScore(player,"tprequest",-1);
                accept = true;
                break;
            }
        }
    }
    if(!accept) {
        sendText("§b§l>>§c您没有待处理的传送请求",player);
    }
}

function reject(player) {   //拒绝传送请求
    let list = getTag(player);
    if (list == null){
        list = [];
    }
    let executor = "";
    let accept = false;
    for (let i = 0; i < list.length; i++) {
        if (/tpa_/.test(list[i]) == true) {
            executor = list[i].replace("tpa_","");
            if(isPlayer(executor)){
                sendText(`§b§l>>§r§c玩家§l§e ${player} §r§c拒绝了你的传送请求`,executor);
                sendText(`§b§l>>§c已拒绝`,player);
                removeTag(player,list[i]);
                setScore(player,"tprequest",-1);
                accept = true;
                break;
            }
        }
        if (/tpahere_/.test(list[i]) == true) {
            executor = list[i].replace("tpahere_","");
            if(isPlayer(executor)){
                sendText(`§b§l>>§r§c玩家§l§e ${player} §r§c拒绝了你的传送请求`,executor);
                sendText(`§b§l>>§c已拒绝`,player);
                removeTag(player,list[i]);
                setScore(player,"tprequest",-1);
                accept = true;
                break;
            }
        }
    }
    if(!accept) {
        sendText("§b§l>>§c您没有待处理的传送请求",player);
    }
}

function chat(executor) {   //查看聊天记录
    if (isOP(executor)) {
        sendText(chatRecord, executor);
    } else {
        sendErr("chat", executor);
    }
}

function say(text) {    //say
    run(`say ${text}`);
}

function sendErr(cmd, executor) {   //cmd不存在或权限不足报错
    sendText(`§l§b>>§c未知的命令: ${cmd} ,输入_help以获取帮助§r`, executor);
}

function getScore(player, obj) {    //获取玩家分数
    try{
        let json = (world.getDimension("overworld").runCommand(`scoreboard players test ${player} ${obj} * *`));
        return Number(json.statusMessage.split(" ")[1]);
    } catch(err) {
        return NaN;
    }
}

function getTag(player) {   //获取玩家标签数组
    addTag(player, "tempTag");
    try{
        let json = (world.getDimension("overworld").runCommand(`tag ${player} list`));
        removeTag(player, "tempTag");
        while(json.statusMessage.includes("§a")) json.statusMessage = json.statusMessage.replace("§a","");
        while(json.statusMessage.includes("§r")) json.statusMessage = json.statusMessage.replace("§r","");
        while(json.statusMessage.includes(" ")) json.statusMessage = json.statusMessage.replace(" ","");
        while(json.statusMessage.includes("，")) json.statusMessage = json.statusMessage.replace("，",",");
        while(json.statusMessage.includes("：")) json.statusMessage = json.statusMessage.replace("：",":");
        return json.statusMessage.split(":")[1].split(",")
    } catch(err) {
        removeTag(player, "tempTag");
        return null;
    }
}

function setScore(player, obj, score) {    //设置玩家分数
    run(`scoreboard players set ${player} ${obj} ${score}`)
}

function addTag(player, tagName) {    //添加标签
    run(`tag ${player} add ${tagName}`)
}

function removeTag(player, tagName) {   //移除标签
    run(`tag ${player} remove ${tagName}`)
}

function isScore(player, obj, score) {    //判断分数是否为预设值
    if (isPlayer(player)) {
        if (getScore(player,obj) == score) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function isTag(player, tagName) {   //判断是否含有某个标签
    if(isPlayer(player)) {
        if (getTag(player).includes(tagName)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false
    }
}

function help(cmd,name) {   //自定义帮助命令
    switch(cmd){
        case "all":
            help("timeset", name);
            help("getpos", name);
            help("sethome", name);
            help("removehome", name);
            help("homelist", name);
            help("tp", name);
            help("set", name);
            help("help", name);
            help("survival", name);
            help("spawnpoint", name);
            help("tpa", name);
            help("tpahere", name);
            help("fill", name);
            help("mute", name);
            help("unmute", name);
            help("broadcast", name);
            help("chat", name);
            help("chatreset", name);
            help("give", name);
            help("init", name);
            break;
        case "fill":
            sendText("§a_fill <x1:int> <y1:int> <z1:int> <x2:int> <y2:int> <z2:int> <block:string> [data:int],在指定区域填充指定方块,PERMISSION:operator",name);
            break;
        case "getpos":
            sendText("§a_getpos,获取坐标并保存数值,PERMISSION:member",name);
            break;
        case "help":
            sendText("§a_help [command:str],获取cmd的用法,PERMISSION:member",name);
            break;
        case "timeset":
            sendText("§a_timeset,校准服务器时间为UTC+8时,PERMISSION:member",name);
            break;
        case "sethome":
            sendText("§a_sethome <name:str>,将所在地保存为名为name的传送点,PERMISSION:member",name);
            break;
        case "removehome":
            sendText("§a_removehome <name:str>,移除名为name的传送点,PERMISSION:member",name);
            break;
        case "homelist":
            sendText("§a_homelist,查询您的所有传送点名,PERMISSION:member",name);
            break;
        case "tp":
            sendText("§a_tp <name:str>,传送至名为name的传送点,name可为主城(maincity),商店(shop)以及自定义的传送点名,PERMISSION:member",name);
            break;
        case "set":
            sendText("§a_set <settings:str> <true/false:boolean>,修改设置状态值,settings可为musicdisplay/musicplayer,PERMISSION:member",name);
            break;
        case "survival":
            sendText("§a_survival,更改为生存模式(非生存区域不会生效),PERMISSION:member",name);
            break;
        case "spawnpoint":
            sendText("§a_spawnpoint,设置重生点,PERMISSION:member",name);
            break;
        case "tpa":
            sendText("§a_tpa <name:str>,申请传送至玩家name处,PERMISSION:member",name);
            break;
        case "tpahere":
            sendText("§a_tpahere <name:str>,申请玩家name传送至执行者处,PERMISSION:member",name);
            break;
        case "mute":
            sendText("§a_mute <player:str> [time:number],对player禁言操作time分钟,默认为10分钟,PERMISSION:operator",name);
            break;
        case "unmute":
            sendText("§a_unmute <player:str>,对player解除禁言,PERMISSION:operator",name);
            break;
        case "broadcast":
            sendText("§a_broadcast <page:int>,公告预设的第page条信息,PERMISSION:operator",name);
            break;
        case "give":
            sendText("§a_give,给予执行者开发工具,PERMISSION:operator",name);
            break;
        case "chat":
            sendText("§a_chat,查询服务器自上次启动以来的聊天记录,PERMISSION:operator",name);
            break;
        case "chatreset":
            sendText("§a_chatreset,清除聊天记录,PERMISSION:operator",name);
            break;
        case "init":
            sendText("§a_init,初始化function,PERMISSION:operator",name);
            break;
        default:
            sendText(`§b§l>>§r§c未找到命令: ${cmd}`,name);
            break;
    }
}

function set(name, setting, bool) {    //自定义设置命令
    setting = setting.toLowerCase();
    bool = bool.toLowerCase();
    if (bool == "true" || bool == "false") {
        switch(setting) {
            case "musicdisplay":
                if (bool == "true") {
                    run(`tag add @a[name=${name}] musicDisplay`);
                } else {
                    run(`tag remove @a[name=${name}] musicDisplay`);
                }
            sendText(`§l§b>>§a已将设置项§e ${setting} §a设置为§e ${bool}`,name);
            break;
            case "musicplayer":
                if (bool == "true") {
                    run(`tag add @a[name=${name}] musicplayer`);
                } else {
                    run(`tag remove @a[name=${name}] musicplayer`);
                }
            sendText(`§l§b>>§a已将设置项§e ${setting} §a设置为§e${bool}`,name);
            break;

            default:
                sendText(`§l§b>>§c未找到设置项§e ${setting}`,name);
        }
    } else {
        sendText(`§b§l>>§cargs值§e ${bool} §c错误,它应为布尔值`,name);
    }
}

function fill(x1,y1,z1,x2,y2,z2,block,data,name) {    //自定义fill命令
    x1 = Number(x1);
    x2 = Number(x2);
    y1 = Number(y1);
    y2 = Number(y2);
    z1 = Number(z1);
    z2 = Number(z2);
    data = Number(data);
    if(!isNaN(x1)&&!isNaN(x2)&&!isNaN(y1)&&!isNaN(y2)&&!isNaN(z1)&&!isNaN(z2)&&!isNaN(data)) {
        if (x1 > x2) x1 = [x2,x2 = x1][0];
        if (y1 > y2) y1 = [y2,y2 = y1][0];
        if (z1 > z2) z1 = [z2,z2 = z1][0];
        var i = x2,j = y2,k = z2;
        sendText("§b§l>>§eStart",name)
        for (i = x2, j = y2, k = z2; i-31 >= x1; i-=32) {
            for (j = y2, k = z2; j-31 >= y1; j-=32) {
                for (k = z2; k-31 >= z1; k-=32) {
                    run(`tp @a[name=${name}] ${i} ${j} ${k}`);
                    run(`fill ${i} ${j} ${k} ${i-31} ${j-31} ${k-31} ${block} ${data}`);
                } run(`tp @a[name=${name}] ${i} ${j} ${k}`);
                run(`fill ${i} ${j} ${k} ${i-31} ${j-31} ${z1} ${block} ${data}`);
            }
            for (k=z2;k-31>=z1;k-=32){
                run(`tp @a[name=${name}] ${i} ${j} ${k}`);
                run(`fill ${i} ${j} ${k} ${i-31} ${y1} ${k-31} ${block} ${data}`);
            } run(`tp @a[name=${name}] ${i} ${j} ${k}`);
            run(`fill ${i} ${j} ${k} ${i-31} ${y1} ${z1} ${block} ${data}`);

        }
        for (j=y2;j-31>=y1;j-=32) {
            for (k=z2;k-31>=z1;k-=32) {
                run(`tp @a[name=${name}] ${i} ${j} ${k}`);
                run(`fill ${i} ${j} ${k} ${x1} ${j-31} ${k-31} ${block} ${data}`);
            } run(`tp @a[name=${name}] ${i} ${j} ${k}`);
            run(`fill ${i} ${j} ${k} ${x1} ${j-31} ${z1} ${block} ${data}`);

        }
        for (k=z2;k-31>=z1;k-=32) {
            run(`tp @a[name=${name}] ${i} ${j} ${k}`);
            run(`fill ${i} ${j} ${k} ${x1} ${y1} ${k-31} ${block} ${data}`);
        } run(`tp @a[name=${name}] ${i} ${j} ${k}`);
        run(`fill ${i} ${j} ${k} ${x1} ${y1} ${z1} ${block} ${data}`);


        sendText("§b§l>>§eFill is completed!",name)

    } else {
        sendText(`§b§l>>§cargs值错误,它应为数值`,name);
    }
}

function mute(player, time, executor) {    //自定义禁言命令
    if (isPlayer(player)) {
        if (player.toLowerCase() == "moonkey2519" || player.toLowerCase() == "moonkey233") {
            sendText("§b§l>>§c您无权禁言服主",executor)
        } else {
            if (!isNaN(Number(time))) {
                addTag(player, "mute");
                setScore(player, "mute", time);
                sendText(`§b§l>>§r§c已禁言玩家§l§e ${player} §c${time}§r§c分钟`,executor);
                sendText(`§b§l>>§r§c您被§l§e ${executor} §r§c禁言${time}分钟`,player);
            } else {
                sendText(`§b§l>>§cargs值§e ${time} §c错误,它应为数值`,executor);
            }
        }
    } else {
        sendText(`§b§l>>§r§c未找到玩家§l§e ${player}`,executor);
    }
}

function unmute(player, executor) {    //自定义解除禁言命令
    if(isPlayer(player)) {
        removeTag(player, "mute");
        setScore(player, "mute", -1);
        sendText(`§b§l>>§r§a已解除玩家§l§e ${player} §r§a的禁言`,executor);
        sendText(`§b§l>>§r§a您被§l§e ${executor} §r§a解除禁言`,player);
    } else {
        sendText(`§b§l>>§r§c未找到玩家§l§e ${player}`,executor);
    }
}

function broadcast(num) {    //自定义公告命令
    switch (num) {
        case "0":
            run("say broadcast 0");
            break;
        case "1":
            run("say broadcast 1");
            break;
        default:
            run(`say §c未找到公告: ${num}`);
    }
}

function give(player) {    //自定义获取命令
    run(`gamemode 1 @a[name=${player}]`);
    run(`give @a[name=${player}] chain_command_block`);
    run(`give @a[name=${player}] structure_bllock`);
    run(`give @a[name=${player}] barrier`);
    run(`give @a[name=${player}] netherite_sword`);
    run(`effect @a[name=${player}] invisibility 1800 255 true`);
}

function run(cmd) {    //提高runcmd容错率
    try {
        world.getDimension("overworld").runCommand(`${cmd}`);
    } catch (err) {

    }
}

function isPlayer(player) {    //判断玩家是否在世界
    let p = world.getPlayers();
    for (let i = 0; i < p.length; i++) {
        if (player.toLowerCase() == p[i].nameTag.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function isSurvival(player) {    //判断是否为生存模式
    try {
        let json = (world.getDimension("overworld").runCommand(`testfor @a[m=0]`));
        json.statusMessage = json.statusMessage.toLowerCase();
        while(json.statusMessage.includes("，")) json.statusMessage = json.statusMessage.replace("，",",");
        while(json.statusMessage.includes("：")) json.statusMessage = json.statusMessage.replace("：",":");
        while(json.statusMessage.includes(", ")) json.statusMessage = json.statusMessage.replace(", ",",");
        let list = json.statusMessage.split(" ")[1].split(",");
        if (list.includes(player.toLowerCase())) {
            return true;
        } else {
            return false;
        }
    } catch (err) {

    }
}

function isCreative(player) {    //判断是否为创造模式
    try {
        let json = (world.getDimension("overworld").runCommand(`testfor @a[m=1]`));
        json.statusMessage = json.statusMessage.toLowerCase();
        while(json.statusMessage.includes("，")) json.statusMessage = json.statusMessage.replace("，",",");
        while(json.statusMessage.includes("：")) json.statusMessage = json.statusMessage.replace("：",":");
        while(json.statusMessage.includes(", ")) json.statusMessage = json.statusMessage.replace(", ",",");
        let list = json.statusMessage.split(" ")[1].split(",");
        if (list.includes(player.toLowerCase())) {
            return true;
        } else {
            return false;
        }
    } catch (err) {

    }
}