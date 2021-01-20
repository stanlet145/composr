function _(query) {
    return document.querySelector(query);
}

function _all(query) {
    return document.querySelectorAll(query);
}

let player = _(".player");
let toggleSongList = _(".player .toggle-list");
let composerResultsList = _(".results .list");

let currentSongIndex = 0;
/*
used to store song volume
*/
let songVolume = 0.5;
/*
used to store recently used volume before mute button was pressed
*/
let songVolumeFlag = 0.5;
/*
Not a database obviously, but entities kept in an array
*/
let songDatabase = [{
        thumbnail: "outsider_no_more_thumbnail.jpg",
        audio: "outsider_no_more.mp3",
        songname: "Outsider No More",
        artistname: "P.T. Adamczyk",
        artistid: 1
    },
    {
        thumbnail: "pt_adamczyk_juiced_up_thumbnail.jpg",
        audio: "pt_adamczyk_juiced_up.mp3",
        songname: "Juiced Up",
        artistname: "P.T. Adamczyk",
        artistid: 1
    },
    {
        thumbnail: "pt_adamczyk_rebel_path_thumbnail.jpg",
        audio: "pt_adamczyk_rebel_path.mp3",
        songname: "Rebel Path",
        artistname: "P.T. Adamczyk",
        artistid: 1
    }, {
        thumbnail: "kerry_eurodayne_chippin_in_thumbnail2.jpg",
        audio: "kerry_eurodayne_chippin_in.mp3",
        songname: "Chippin' in",
        artistname: "Kerry Eurodayne",
        artistid: 2
    },
    {
        thumbnail: "kerry_eurodayne_a_like_supreme_thumbnail.jpg",
        audio: "kerry_eurodayne_a_like_supreme.mp3",
        songname: "A like Supreme",
        artistname: "Kerry Eurodayne",
        artistid: 2
    },
    {
        thumbnail: "kerry_eurodayne_yacht_song_thumbnail.jpg",
        audio: "kerry_eurodayne_yacht_song.mp3",
        songname: "Yacht Song",
        artistname: "Kerry Eurodayne",
        artistid: 2
    },
    {
        thumbnail: "ichika_nito_homesick_tumbnail.jpg",
        audio: "ichika_nito_homesick.mp3",
        songname: "Homesick",
        artistname: "Ichika Nito",
        artistid: 3
    },
    {
        thumbnail: "driveways_skeletons_thumbnail.jpg",
        audio: "driveways_skeletons.mp3",
        songname: "Skeletons",
        artistname: "Driveways",
        artistid: 4
    },
    {
        thumbnail: "filipek_no_make_up_thumbnail.jpg",
        audio: "filipek_no_make_up.mp3",
        songname: "No Make Up",
        artistname: "Filipek",
        artistid: 5
    }
];

let composerDatabase = [{
        artistid: 1,
        artistname: "P.T. Adamczyk",
        songCounter: 0
    },
    {
        artistid: 2,
        artistname: "Kerry Eurodayne",
        songCounter: 0
    }, {
        artistid: 3,
        artistname: "Ichika Nito",
        songCounter: 0
    }, {
        artistid: 4,
        artistname: "Driveways",
        songCounter: 0
    }, {
        artistid: 5,
        artistname: "Filipek",
        songCounter: 0
    }
];

let composerList = composerDatabase;
let songSearchList = songDatabase;

/*
Song array we requested
*/
let songList = [];
let g_pickedArtist = 1;
let g_pickedSong;


function fillCurrentPlayList(pickedArtist) {
    g_pickedArtist = pickedArtist;
    songList = [];
    for (let i = 0; i < songDatabase.length; i++) {
        if (songDatabase[i].artistid == pickedArtist) {
            songList.push(songDatabase[i]);
        }
    }
}

fillCurrentPlayList(g_pickedArtist);

let main = {
    audio: _(".player .main audio"),
    thumbnail: _(".player .main img"),
    seekbar: _(".player .main .seekbar input"),
    songname: _(".player .main .details h2"),
    artistname: _(".player .main .details p"),
    prevControl: _(".player .main .controls .prev-control"),
    playPauseControl: _(".player .main .controls .play-pause-control"),
    nextControl: _(".player .main .controls .next-control"),
    playico: _(".player .main .controls #play-ico"),
    pauseico: _(".player .main .controls #pause-ico"),
    volumebar: _(".player .main .volumebar input"),
    volumebarControl: _(".player .main .volumebar"),
    volumeUpIco: _(".player .main .volume-panel .speaker-control #volume-up"),
    volumeMutedIco: _(".player .main .volume-panel .speaker-control #volume-muted"),
    speakerControl: _(".player .main .volume-panel .speaker-control"),
    repeatControl: _(".player .main .repeat-panel"),
    listControl: _(".player .player-list .toggle-list"),
    artistnameFromList: _(".results .list .item .details p"),
    entitySearch: _(".as .collapse .navbar-nav li #input_container #search"),
    composerListPop: _(".composer-list-pop")
}

function initComposerListInHtml() {
    _(".results .list").innerHTML = (composerList.map(function(composer, composerIndex) {
        return `
        <div class="item">
            <div class="details" composerIndex="${composerIndex}" artistName="${composer.artistname}">
                <p style="display: inline-block">${composer.artistname}</p>
                <i id="artist-play-ico${composerIndex}" class="far fa-play-circle" style="display: inline-block"></i>
            </div>
        </div>
    `;
    }).join(""));
}

initComposerListInHtml();

function initSongListInHtml() {
    _(".player .player-list .list").innerHTML = (songList.map(function(song, songIndex) {
        return `
            <div class="item" songIndex="${songIndex}">
                <div class="thumbnail">
                    <img src="./files/${song.thumbnail}">
                </div>
                <div class="details">
                    <h2>${song.songname}</h2>
                    <p>${song.artistname}</p>
                </div>
            </div>
        `;
    }).join(""));
}
initSongListInHtml();

function initSongsListInHtml() {
    _(".results .list-found-songs").innerHTML = (songSearchList.map(function(song, songIndex) {
        return `
        <div class="item" songIndex="${songIndex}" songName="${song.songname}">
            <div class="details">
                <p style="display: inline-block">${song.songname}</p>
            </div>
        </div>
    `;
    }).join(""));
}

initSongsListInHtml();
/*
 * songVolume -  according to global volume parameter
 * songIndex - global parameter
 */
let isRepeat = false;
main.repeatControl.classList.remove("repeat");

function loadSong(songIndex) {
    let song = songList[songIndex];
    markCurrentlyPlaying(song);
    setThumbnailForCurrentSong(song);
    setBackGroundForCurrentSong(song);
    setHeaderAndParaForCurrentSong(song);
    initSeekbarAttributes();
    initVolumebarAccordingToVolume(songVolume);
    main.audio.setAttribute("src", "./files/" + song.audio);
    main.audio.addEventListener("canplay", function() {
        main.audio.play();
        if (!main.audio.paused) {
            main.playPauseControl.classList.remove("songPaused");
        }
        if (songVolume > 0) {
            main.speakerControl.classList.remove("muted");
        }
        main.seekbar.setAttribute("max", parseInt(main.audio.duration));
        main.audio.onended = function() {
            if (!isRepeat) {
                main.nextControl.click();
            } else {
                main.audio.currentTime = 0;
            }
        }
    });
    highlightCurrentlyPlaying();
    isSongPartOfPlayList(song);
}

function markCurrentlyPlaying(song) {
    g_pickedSong = song;
}

function setThumbnailForCurrentSong(song) {
    main.thumbnail.setAttribute("src", "./files/" + song.thumbnail);
}

function setBackGroundForCurrentSong(song) {
    document.body.style.background = `radial-gradient(transparent, black), url("./files/${song.thumbnail}") center no-repeat`;
    document.body.style.backgroundSize = "cover";
}


function setHeaderAndParaForCurrentSong(song) {
    main.songname.innerText = song.songname;
    main.artistname.innerText = song.artistname;
    document.title = main.songname.innerText;
}

function initSeekbarAttributes() {
    main.seekbar.setAttribute("value", 0);
    main.seekbar.setAttribute("min", 0);
    main.seekbar.setAttribute("max", 0);
}

function initVolumebarAccordingToVolume(currentSongVolume) {
    main.volumebar.value = currentSongVolume * 100;
    main.audio.volume = currentSongVolume;
}

setInterval(function() {
    main.seekbar.value = parseInt(main.audio.currentTime);
}, 1000);

main.seekbar.addEventListener("change", function() {
    main.audio.currentTime = main.seekbar.value;
});

main.playPauseControl.addEventListener("click", function() {
    if (main.audio.paused) {
        main.playPauseControl.classList.remove("songPaused");
        main.audio.play();
    } else {
        main.playPauseControl.classList.add("songPaused");
        main.audio.pause();
    }
});

$(window).keypress(function(e) {
    if (e.which === 32) {
        e.preventDefault();
        main.playPauseControl.click();
    }
});


main.nextControl.addEventListener("click", function() {
    if (currentSongIndex === songList.length - 1) {
        currentSongIndex = 0;
    } else {
        currentSongIndex++;
    }
    loadSong(currentSongIndex);
    switchSongInPlayList();
});

main.prevControl.addEventListener("click", function() {
    if (currentSongIndex === 0) {
        currentSongIndex = songList.length - 1;
    } else {
        currentSongIndex--;
    }
    loadSong(currentSongIndex);
    switchSongInPlayList();
});

main.volumebar.addEventListener("input", function() {
    if (main.volumebar.value > 0) {
        main.speakerControl.classList.remove("muted");

    } else {
        main.speakerControl.classList.add("muted");
    }
    main.audio.volume = main.volumebar.value / 100;
    songVolume = main.audio.volume;
});

main.speakerControl.addEventListener("click", function() {
    if (main.volumebar.value > 0) {
        songVolumeFlag = songVolume;
        muteVolume();
    } else {
        restoreVolume();
    }
});

function muteVolume() {
    main.speakerControl.classList.add("muted");
    main.volumebar.value = 0;
    main.audio.volume = 0;
    songVolume = 0;
}

function restoreVolume() {
    main.speakerControl.classList.remove("muted");
    main.volumebar.value = songVolumeFlag * 100;
    main.audio.volume = songVolumeFlag;
    songVolume = songVolumeFlag;
    songVolumeFlag = 0;
}

main.repeatControl.addEventListener("click", function() {
    if (isRepeat) {
        isRepeat = false;
        main.repeatControl.classList.remove("repeat");
    } else {
        isRepeat = true;
        main.repeatControl.classList.add("repeat");
    }
});

toggleSongList.addEventListener("click", function() {
    toggleSongList.classList.toggle("toggled");
    player.classList.toggle("activeSongList");
});

/*
Artist Switch mechanism start
*/
let currentArtistIndex = 0;
let composerListItems;

function initializeComposerListItemsListeners() {
    currentArtistIndex = 0;
    composerListItems = _all(".results .list .item .details");
    for (let i = 0; i < composerListItems.length; i++) {
        composerListItems[i].addEventListener("click", function() {
            dropFocusFromPlaylist(); //not running in instance of playlist anymore
            currentArtistIndex = parseInt(composerListItems[i].getAttribute("composerIndex"));
            obtainArtistForIndex(currentArtistIndex);
        });
    }
}
initializeComposerListItemsListeners();

//TO:DO check why we have to click twice even if artist is selected
function obtainArtistForIndex(index) {
    let artist = composerList[index].artistid;
    if (artist === g_pickedArtist) {
        _(".results .list .item .details #artist-play-ico" + index).addEventListener("click", function() {
            toggleSongList.click();
        });
        //   return;
    }
    fillCurrentPlayList(artist);
    refreshSongs();
}

function refreshSongs() {
    initSongListInHtml();
    currentSongIndex = 0;
    loadSong(currentSongIndex);
    initializeSongListItemsListeners();
}
/*
Artist Switch mechanism end
*/
let songListItems;

function initializeSongListItemsListeners() {
    songListItems = _all(".player .player-list .list .item");
    for (let i = 0; i < songListItems.length; i++) {
        songListItems[i].addEventListener("click", function() {
            currentSongIndex = parseInt(songListItems[i].getAttribute("songIndex"));
            loadSong(currentSongIndex);
            player.classList.remove("activeSongList");
        });
    }
}

initializeSongListItemsListeners();

/*
SONG SWITCH MECHANISM
*/
let songSearchListItems;

function initializeSearchedSongsListItemsListeners() {
    songSearchListItems = _all(".results .list-found-songs .item");
    for (let i = 0; i < songSearchListItems.length; i++) {
        songSearchListItems[i].addEventListener("click", function() {
            dropFocusFromPlaylist(); //not running in instance of playlist anymore
            const result = songDatabase.find(e => e.songname === songSearchListItems[i].getAttribute("songName"));
            songList = [];
            songList.push(result);
            fillRestSongsByArtist(result.artistname, result);
            refreshSongs();
        });
    }
}

initializeSearchedSongsListItemsListeners();


function fillRestSongsByArtist(artistName, result) {
    for (let i = 0; i < songDatabase.length; i++) {
        if (songDatabase[i] != result) {
            if (songDatabase[i].artistname == artistName) {
                songList.push(songDatabase[i]);
            }
        }
    }
}

function searchForArtist(phrase) {
    composerList = [];
    for (let i = 0; i < composerDatabase.length; i++) {
        let name = composerDatabase[i].artistname;
        name = name.toLowerCase();
        if (name.includes(phrase.toLowerCase())) {
            composerList.push(composerDatabase[i]);
        }
    }
    refreshArtists();
}

function searchForSong(phrase) {
    songSearchList = [];
    for (let i = 0; i < songDatabase.length; i++) {
        let name = songDatabase[i].songname;
        name = name.toLowerCase();
        if (name.includes(phrase.toLowerCase())) {
            songSearchList.push(songDatabase[i]);
        }
    }
    refreshSearchSongList();
}

main.entitySearch.addEventListener("input", function() {
    let searchedPhrase = main.entitySearch.value;
    searchForArtist(searchedPhrase);
    searchForSong(searchedPhrase);
    highlightCurrentlyPlaying();
    if (isHidden) {
        main.composerListPop.click();
    }
});

function highlightCurrentlyPlaying() {
    for (let i = 0; i < songSearchListItems.length; i++) {
        if (songSearchListItems[i].getAttribute("songName") == g_pickedSong.songname) {
            songSearchListItems[i].style = "background-color: #00acee";
        } else {
            songSearchListItems[i].style = "background-color: none";
        }
    }
    for (let i = 0; i < composerListItems.length; i++) {
        if (composerListItems[i].getAttribute("artistName") == g_pickedSong.artistname) {
            composerListItems[i].style = "background-color: #00acee";
        } else {
            composerListItems[i].style = "background-color: none";
        }
    }
}

function refreshArtists() {
    initComposerListInHtml();
    currentArtistIndex = 0;
    initializeComposerListItemsListeners();
}

function refreshSearchSongList() {
    initSongsListInHtml();
    initializeSearchedSongsListItemsListeners();
}

let isHidden = false;
main.composerListPop.addEventListener("click", function() {
    if (!isHidden) {
        _(".results").classList.add("hidden");
        _(".footer-container").classList.add("hidden");
        isHidden = true;
    } else {
        _(".results").classList.remove("hidden");
        _(".footer-container").classList.remove("hidden");
        isHidden = false;
    }
});

function colorInitialArtist() {
    composerListItems[0].style = "background-color: #00acee";
}
colorInitialArtist();

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