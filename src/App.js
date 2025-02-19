import "./App.css";
import { HashTagToolProvider } from "./components/HashtagTool";
import PostViewTool from "./components/Post/post.js";
import HeaderBar from "./components/Login";
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import HashtagTool from "./components/HashtagTool";
import NFSWFeed, { NFSWProvider } from "./components/CategoryView/NFSWFeed";
import NatureFeed, {
    NatureProvider,
} from "./components/CategoryView/NatureProvider";

function App() {
    const pageFilters = {
        "/": null, // Default filters (null or any other default filters you want to use)
        "/nsfw": ["tits", "boobs", "ass"],
        "/nature": ["nature", "flowers", "sky", "sea"],
        "/food": ["food"],
        "/photography": ["photography"],
    };

    // const location = useLocation();

    return (
        <div>
            <Router>
                <HeaderBar />
                <HashTagToolProvider>
                    <Routes>
                        <Route exact path="/" element={<HashtagTool />} />
                        <Route
                            path="/post/:postId"
                            element={<PostViewTool />}
                        />
                    </Routes>
                </HashTagToolProvider>
                <NFSWProvider filterTags={pageFilters["/nsfw"]}>
                    <Routes>
                        <Route exact path="/nsfw" element={<NFSWFeed />} />
                    </Routes>
                </NFSWProvider>
                <NatureProvider filterTags={pageFilters["/nature"]}>
                    <Routes>
                        <Route exact path="/nature" element={<NatureFeed />} />
                    </Routes>
                </NatureProvider>
                <NatureProvider filterTags={pageFilters["/food"]}>
                    <Routes>
                        <Route exact path="/food" element={<NatureFeed />} />
                    </Routes>
                </NatureProvider>
                <NatureProvider filterTags={pageFilters["/photography"]}>
                    <Routes>
                        <Route
                            exact
                            path="/photography"
                            element={<NatureFeed />}
                        />
                    </Routes>
                </NatureProvider>
            </Router>
        </div>
    );
}

export default App;
