import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music, Search, Library, Heart, Download } from 'lucide-react';

const MusicIdentifierPlatform = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
audioUrl: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
audioUrl: "https://www.zapsplat.com/..." 

  // Sample library with real audio sources (you'll replace these with your actual API endpoints)
  const [library, setLibrary] = useState([
    {
      id: 1,
      title: "Sample Track 1",
      artist: "Demo Artist",
      album: "Demo Album",
      duration: "3:45",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Replace with your API endpoint
      coverArt: "https://via.placeholder.com/300x300/667eea/ffffff?text=Track+1",
      liked: false
    },
    {
      id: 2,
      title: "Sample Track 2",
      artist: "Demo Artist 2",
      album: "Demo Album 2",
      duration: "4:12",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Replace with your API endpoint
      coverArt: "https://via.placeholder.com/300x300/764ba2/ffffff?text=Track+2",
      liked: true
    },
    {
      id: 3,
      title: "Sample Track 3",
      artist: "Demo Artist 3",
      album: "Demo Album 3",
      duration: "2:58",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Replace with your API endpoint
      coverArt: "https://via.placeholder.com/300x300/f093fb/ffffff?text=Track+3",
      liked: false
    }
  ]);

  // Real audio loading and playback functions
  const loadAndPlaySong = async (song) => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      
      // Stop current song if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up progress tracking for loading
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Set up audio event listeners
      audio.addEventListener('loadstart', () => {
        console.log('Starting to load audio...');
      });

      audio.addEventListener('loadeddata', () => {
        console.log('Audio data loaded');
        setLoadingProgress(100);
        clearInterval(progressInterval);
      });

      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
        setIsLoading(false);
        setCurrentSong(song);
        setDuration(audio.duration);
        
        // Auto-play the song
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Playback failed:', err);
          setError('Playback failed. Please try again.');
          setIsLoading(false);
        });
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        setError('Failed to load audio. Please check the URL or try again.');
        setIsLoading(false);
        clearInterval(progressInterval);
      });

      // Set volume
      audio.volume = isMuted ? 0 : volume;

      // Load the audio file
      audio.src = song.audioUrl;
      audio.load();

    } catch (err) {
      console.error('Error loading song:', err);
      setError('Failed to load song. Please try again.');
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Playback failed:', err);
        setError('Playback failed. Please try again.');
      });
    }
  };

  const handleProgressChange = (e) => {
    if (!audioRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleLike = (songId) => {
    setLibrary(prev => prev.map(song => 
      song.id === songId ? { ...song, liked: !song.liked } : song
    ));
  };

  const filteredLibrary = library.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Music className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tehillz_MusicID Pro
            </h1>
          </div>
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'library' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Library className="h-5 w-5" />
              <span>Library</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'search' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Loading song... {loadingProgress}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Music Library */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredLibrary.map((song) => (
            <div key={song.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={song.coverArt} 
                  alt={song.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{song.title}</h3>
                  <p className="text-gray-300">{song.artist}</p>
                  <p className="text-gray-400 text-sm">{song.album}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loadAndPlaySong(song)}
                    disabled={isLoading}
                    className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading && currentSong?.id === song.id ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </button>
                  <span className="text-sm text-gray-400">{song.duration}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleLike(song.id)}
                    className={`p-2 rounded-full transition-all ${
                      song.liked 
                        ? 'text-red-400 hover:text-red-300' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${song.liked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-white transition-all">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Now Playing Bar */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/20 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <img 
                    src={currentSong.coverArt} 
                    alt={currentSong.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{currentSong.title}</h4>
                    <p className="text-gray-300 text-sm">{currentSong.artist}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full text-gray-400 hover:text-white transition-all">
                    <SkipBack className="h-5 w-5" />
                  </button>
                  <button
                    onClick={togglePlayPause}
                    className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-200"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-white transition-all">
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="p-2 rounded-full text-gray-400 hover:text-white transition-all">
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 w-12">{formatTime(currentTime)}</span>
                <div 
                  ref={progressRef}
                  onClick={handleProgressChange}
                  className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer relative"
                >
                  <div 
                    className="h-2 bg-purple-600 rounded-full transition-all duration-100"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400 w-12">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicIdentifierPlatform;