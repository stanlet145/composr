let playList = [];
let playlistActive = false;


let playlist_main = {
    playlistPopButton: _(".as .collapse .navbar-nav .playlist-toggler-row"),
    plusButton: _(".player .main .plus-control"),
    playlistSong: _(".playlist .songList .item"),
    trashCan: _(".playlist .playlist-header .dump-control")
}

let isPlaylistHidden = true;
playlist_main.playlistPopButton.addEventListener("click", function() {
    if (!isPlaylistHidden) {
        _(".playlist").classList.add("hidden");
        isPlaylistHidden = true;
    } else {
        _(".playlist").classList.remove("hidden");
        isPlaylistHidden = false;
    }
});


playlist_main.plusButton.addEventListener("click", function() {
    if (!isSongPartOfPlayList(g_pickedSong)) {
        playList.push(g_pickedSong);
        if (isPlaylistHidden) {
            playlist_main.playlistPopButton.click();
        }
        playlist_main.plusButton.classList.add("added");
    } else {
        for (let i = 0; i < playList.length; i++) {
            if (g_pickedSong.songname == playList[i].songname) {
                const index = playList.indexOf(playList[i]);
                if (index > -1) {
                    playList.splice(index, 1);
                }
                playlist_main.plusButton.classList.remove("added");
            }
        }
        refreshSongsForPlaylist();
    }
    initSongsForPlayListInHtml();
    initPlaylistSongListeners();
});

function isSongPartOfPlayList(song) {
    let isPartOf = false;
    for (let i = 0; i < playList.length; i++) {
        if (song.songname == playList[i].songname) {
            isPartOf = true;
            playlist_main.plusButton.classList.add("added");
            return isPartOf;
        }
    }
    playlist_main.plusButton.classList.remove("added");
    return isPartOf;
}

function initSongsForPlayListInHtml() {
    _(".playlist .songList").innerHTML = (playList.map(function(song1, songIndex1) {
        return `
            <div class="item" songIndex="${songIndex1}" songName="${song1.songname}">
                <div class="thumbnail">
                    <img src="./files/${song1.thumbnail}">
                </div>
                <div class="details">
                    <h2 id="draggable${songIndex1}" draggable="true" ondragstart="drag(event)" ondrop="drop(event)" ondragover="allowDrop(event)">${song1.songname}</h2>
                    <p>${song1.artistname}</p>
                    <i class="fab fa-itunes-note"></i>
                </div>
            </div>
        `;
    }).join(""));
}

initSongsForPlayListInHtml();

let playlistItems;

function initPlaylistSongListeners() {
    playlistItems = _all(".playlist .songList .item");
    for (let i = 0; i < playlistItems.length; i++) {
        playlistItems[i].addEventListener("click", function() {
            activatePlaylist();
            currentSongIndex = parseInt(playlistItems[i].getAttribute("songIndex"));
            loadSong(currentSongIndex);
            for (let i = 0; i < playlistItems.length; i++) {
                playlistItems[i].classList.remove("played");
            }
            playlistItems[i].classList.add("played");
        });
    }
}

function switchSongInPlayList() {
    if (playlistActive) {
        const result = playList.find(e => e.songname === g_pickedSong.songname);
        for (let i = 0; i < playlistItems.length; i++) {
            if (playlistItems[i].getAttribute("songName") == result.songname) {
                playlistItems[i].classList.add("played");
            } else {
                playlistItems[i].classList.remove("played");
            }
        }
    }
}

function dropPlaylist() {
    playList = [];
    songList = [];
    initSongsForPlayListInHtml();
}

function dropFocusFromPlaylist() {
    if (playList.length > 0) {
        for (let i = 0; i < playlistItems.length; i++) {
            playlistItems[i].classList.remove("played");
        }
        playlistActive = false;
    }
}



function activatePlaylist() {
    playlistActive = true;
    songList = playList;
    refreshSongsForPlaylist();
}

function refreshSongsForPlaylist() {
    initSongListInHtml();
    initializeSongListItemsListeners();
}

playlist_main.trashCan.addEventListener("click", function() {
    dropPlaylist();
});

loadSong(currentSongIndex);

/*
drag and drop
*/
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var target = ev.target.innerText;
    data = document.getElementById(data).textContent;
    switchElements(data, target);
}

function switchElements(data, target) {
    let indexData = 0;
    let indexTarget = -1;
    for (let i = 0; i < playList.length; i++) {
        if (playList[i].songname == data) {
            indexData = i;
        }
        if (playList[i].songname == target) {
            indexTarget = i;
        }
    }
    if (indexTarget == -1) {
        removeElement(indexData);
        return;
    }
    var b = playList[indexData];
    playList[indexData] = playList[indexTarget];
    playList[indexTarget] = b;


    activatePlaylist();
    initSongsForPlayListInHtml();
    initPlaylistSongListeners();
    switchSongInPlayList();
    currentSongIndex = indexTarget;
}

function removeElement(indexData) {
    if (indexData != playList.length - 1) {
        currentSongIndex = indexData + 1;
    } else {
        currentSongIndex = 0;
    }
    loadSong(currentSongIndex);
    playList.splice(indexData, 1);
    activatePlaylist();
    initSongsForPlayListInHtml();
    initPlaylistSongListeners();
    switchSongInPlayList();
    if (playList.length == 0) {
        playlist_main.plusButton.classList.remove("added");
    }
}