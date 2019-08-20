var config = {
    wait_time : 8,
    current_index : -1,
    current_story_index : -1,
    swipe: false,
    pageX : 0,
    pageY : 0,
    timer: 0
}

function loadStories(){
    $("#storyList").html("");
    for(var i=0;i<data.length;i++){
        $("#storyList").append(`
            <div class="storyItem" user="`+ data[i].id +`" index="`+ i +`">
                <div class="storyColor">
                    <img src="`+ data[i].profile_picture +`" alt="`+ data[i].name +`">
                </div>
            </div>
        `);
    }
}

var timer;

function progress(){
    if(config.timer < 500){
        config.timer = config.timer + 1;
        var width = 0.2 * config.timer;
        var progressList = $("#storyShowBox .storyProgressBar .progressBarOut");
        $(progressList[config.current_story_index]).find(".progressBarIn").css("width", width + "%");
    }else{
        data[config.current_index].stories[config.current_story_index].watched = true;
        clearInterval(timer);
        config.timer = 0;
        nextStory();
    }
}

function startTimer(){
    timer = setInterval(progress, 10);
}

function openStory(index, selected_story_index = null){
    clearInterval(timer);
    config.timer = 0;
    $("#storyShowBox .storyHeader img").attr("src", data[index].profile_picture);
    $("#storyShowBox .storyHeader .name").text(data[index].name);
    $("#storyShowBox .storyHeader a").attr("href", data[index].profil_url);
    $("#storyShowBox .storyProgressBar").html("");
    story_index = -1;
    for(var j=0;j<data[index].stories.length;j++){
        if(data[index].stories[j].watched == false && story_index == -1){
            story_index = j;
        }
        $("#storyShowBox .storyProgressBar").append(`
            <div class="progressBarOut">
                <div class="progressBarIn"></div>
            </div>
        `);
    }
    if(story_index == -1){
        story_index = 0;
        for(var y=0;y<data[index].stories.length;y++){
            data[index].stories[y].watched = false;
        }
    }
    if(selected_story_index != null){
        story_index = selected_story_index;
    }
    $("#storyShowBox .storyShowItem").css("background-image", "url('"+ data[index].stories[story_index].image +"')");
    $("#storyShowBox").fadeIn();
    config.current_index = index;
    if(story_index + 1 == data[index].stories.length){
        $("#storyList .storyItem").eq(index).addClass("watched");
    }
    config.current_story_index = story_index;
    if(story_index > 0){
        var progressList = $("#storyShowBox .storyProgressBar .progressBarOut");
        for(var p=0;p<story_index;p++){
            $(progressList[p]).find(".progressBarIn").css("width", "100%");
        }
    }
    $("#storyShowBox .storyHeader .time").text(data[index].stories[story_index].time);
    startTimer(story_index);
}

function nextStory(){
    data[config.current_index].stories[config.current_story_index].watched = true;
    current_index = config.current_index;
    redirect = false;
    for(var x=0;x<data[current_index].stories.length;x++){
        if(data[current_index].stories[x].watched == false){
            openStory(current_index);
            redirect = true;
            break;
        }
    }

    if(redirect == false){
        if(config.current_index + 1 < data.length){
            openStory(current_index + 1);
        }else{ 
            $("#storyShowBox").fadeOut();
            clearInterval(timer);
            config.timer = 0;
        }
    }

}

function prevStory(){
    data[config.current_index].stories[config.current_story_index].watched = true;
    current_index = config.current_index;
    current_story_index = config.current_story_index;
    if(current_story_index > 0){
        if(data[current_index].stories.length > current_story_index){
            for(var c=current_story_index-1;c<data[current_index].stories.length;c++){
                data[current_index].stories[c].watched = false;
            }
        }
        openStory(current_index, current_story_index - 1);
    }else{
        if(current_index > 0){
            if(config.current_index > 0){
                openStory(config.current_index - 1);
            }else{
                $("#storyShowBox").fadeOut();
                clearInterval(timer);
                config.timer = 0;
            }
        }
    }
}

$(function(){

    $("#storyShowBox").on("touchstart", function(event){
        var x = event.touches[0].pageX;
        var y = event.touches[0].pageY;
        config.swipe = true;
        config.pageX = x;
        config.pageY = y;
    });

    $("#storyShowBox").on("touchend", function(){
        var x = event.changedTouches[0].clientX;
        var y = event.changedTouches[0].clientY;
        deltaX = x - config.pageX;
        deltaY = y - config.pageY;
        if(deltaY > 150){
            $("#storyShowBox").fadeOut();
            clearInterval(timer);
            config.timer = 0;
        }else if(deltaX < -100){
            if(config.current_index + 1 < data.length){
                openStory(config.current_index + 1);
            }else{
                $("#storyShowBox").fadeOut();
                clearInterval(timer);
                config.timer = 0;
            }
        }else if(deltaX > 100){
            if(config.current_index > 0){
                openStory(config.current_index - 1);
            }else{
                $("#storyShowBox").fadeOut();
                clearInterval(timer);
                config.timer = 0;
            }
        }
        config.swipe = false;
        config.pageX = 0;
        config.pageY = 0;
    });

    loadStories();

    $("#storyList .storyItem img").on("click", function(){
        var index = $(this).parent().parent().index();
        openStory(index);
        config.current_index = index;
    });

    $("#storyShowBox .storyNavigation .rightNavigation").on("click", function(){
        nextStory();
    });

    $("#storyShowBox .storyNavigation .leftNavigation").on("click", function(){
        prevStory();
    });

    $(document).keyup(function(e) {
        if (e.key === "Escape") { 
            $("#storyShowBox").fadeOut();
            clearInterval(timer);
            config.timer = 0;
       }
   });

});