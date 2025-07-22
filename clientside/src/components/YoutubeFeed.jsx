// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './css/YoutubeFeed.css'

// export default function YoutubeFeed() {
//   const [videos, setVideos] = useState([]);

//   useEffect(() => {
//     const fetchYoutubeVideos = async () => {
//       try {
//         const res = await axios.get(
//           'https://www.googleapis.com/youtube/v3/search',
//           {
//             params: {
//               part: 'snippet',
//               q: 'react js',
//               maxResults: 6,
//               type: 'video',
//               key: 'AIzaSyC-rZ7Hu9QLlxzNgiWS7YjXJPR2jjSuwCY',
//             },
//           }
//         );
//         setVideos(res.data.items);
//       } catch (err) {
//         console.error('Failed to fetch YouTube videos:', err);
//       }
//     };

//     fetchYoutubeVideos();
//   }, []);

//   return (
//     <div className="youtube-feed">
//       <h2>YouTube Results</h2>
//       <div className="video-grid">
//         {videos.map((video) => (
//           <div className="video-card" key={video.id.videoId}>
//             <a
//               href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <img
//                 src={video.snippet.thumbnails.medium.url}
//                 alt={video.snippet.title}
//               />
//               <h4>{video.snippet.title}</h4>
//               <p>{video.snippet.channelTitle}</p>
//             </a>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
