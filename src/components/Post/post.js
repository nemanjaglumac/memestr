import { useParams, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./post.css";
import { sendNewZaps, upvotePost } from "../Posts";
import { getEventHash, getSignature, nip19, SimplePool } from "nostr-tools";
import Comments from "../Comments";
import ZapModal from "../ZapHelper/ZapModal";
// import { useHashTagContext } from "./HashtagTool"; // Import the custom hook
// import {useHashTagContext} from "../HashtagTool";

function Post(props) {
    // const { notes, setNotes } = useHashTagContext(); // Access notes and setNotes from the context
    let params = useParams();
    const [searchParams] = useSearchParams();
    const title = searchParams.get("title");
    const postId = params.postId;
    const imageLink = searchParams.get("imageLink");
    const voteCount = searchParams.get("voteCount");
    const opPubKey = searchParams.get("OpPubKey");
    const [replies, setReplies] = useState([]);
    const [comment, setComment] = useState("");

    const captureComment = event => {
        setComment(event.target.value);
    };

    useEffect(() => {
        const getComments = async event => {
            const relayPool = new SimplePool();
            const relays = [
                "wss://relay.damus.io",
                "wss://relay.primal.net",
                "wss://nos.lol",
                "wss://nostr.bitcoiner.social",
            ];
            const filters = {
                kinds: [1],
                "#e": [postId],
            };
            let replies1 = await relayPool.list(relays, [filters]);
            console.log("replies1 is", replies1);
            setReplies(replies1);
            relayPool.close(relays);
        };
        getComments();
    }, [postId]);

    const captureNewComment = async comment => {
        let relays = [
            "wss://relay.damus.io",
            "wss://relay.primal.net",
            "wss://nos.lol",
        ];
        const pool = new SimplePool();
        const storedData = localStorage.getItem("memestr");
        if (!storedData) {
            alert("Login required to comment.");
            return;
        }
        let uesrPublicKey = JSON.parse(storedData).pubKey;
        let userPrivateKey = JSON.parse(storedData).privateKey;
        let sk = nip19.decode(userPrivateKey);
        let commentEvent = {
            kind: 1,
            pubkey: uesrPublicKey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["e", postId],
                ["p", uesrPublicKey],
                ["alt", "reply"],
            ],
            content: comment,
        };

        commentEvent.id = getEventHash(commentEvent);
        commentEvent.sig = getSignature(commentEvent, sk.data);
        console.log("CommenteventId is ", commentEvent.id);
        console.log("calling pool", commentEvent);
        try {
            let x = await pool.publish(relays, commentEvent);
            console.log("called pool", x);
            let c = Promise.resolve(x);
            console.log("c is", c);
        } catch (error) {
            console.error("Error while publishing comment:", error);
        }
        const commentObject = [
            {
                content: comment,
                pubkey: uesrPublicKey,
            },
        ];
        setReplies(replies => [...commentObject, ...replies]);
        console.log("replies after updation is", replies);
        setComment("");
        // c.map((cc) => {console.log(cc)})
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fillZap, setFillZap] = useState(false);
    const [processedValue, setProcessedValue] = useState(null);
    const [votesCount, setVotesCount] = useState(parseInt(voteCount, 10));
    const [fillLike, setFillLike] = useState(false);

    function openModal() {
        setIsModalOpen(true);
    }

    function handleZapButton() {
        const storedData = localStorage.getItem("memestr");
        if (!storedData) {
            alert("Login to send zaps.");
            return false;
        }
        openModal();
        setFillZap(true);
    }

    const handleConfirm = value => {
        // Process the value internally here or update state as needed
        console.log("value is ", value);
        sendNewZaps(postId, opPubKey, value);
        setProcessedValue(value);
    };

    function voteIncrement() {
        const storedData = localStorage.getItem("memestr");
        if (storedData) {
            setVotesCount(votesCount + 1);
        }
    }

    function fillColor() {
        const storedData = localStorage.getItem("memestr");
        if (storedData) {
            setFillLike(true);
        }
    }

    function isTodisabled() {
        return false;
    }

    return (
        <div>
            <div class="bg-gray-100 rounded-lg my-1 shadow-sm shadow-gray-400">
                <div class="flex p-2 text-black font-medium font-sans  text-nowrap items-center">
                    <h1>{title}</h1>
                </div>
                <div className={"post-content"}>
                    <img alt={""} className={"post-content"} src={imageLink} />
                </div>
            </div>
            <div className="flex align-items-center gap-x-3 bg-gray-100 border-b-4 border-white pl-2 pt-2">
                <button
                    className="flex align-items-center"
                    onClick={() => {
                        handleZapButton();
                    }}>
                    <svg
                        className={`${
                            fillZap &&
                            "fill-current text-yellow-300 stroke-black"
                        } h-8 w-8`}
                        xmlns="http://www.w3.org/2000/svg"
                        x="0"
                        y="0"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 30">
                        <path d="M13 2L3 14 12 14 11 22 21 10 12 10 13 2z"></path>
                    </svg>
                    {processedValue && <p>{processedValue}</p>}
                    <ZapModal isOpenm={isModalOpen} onConfirm={handleConfirm} />
                </button>

                <button
                    className="flex"
                    onClick={async event => {
                        event.preventDefault();
                        await upvotePost(postId);
                        voteIncrement();
                        fillColor();
                    }}
                    disabled={isTodisabled()}>
                    <svg
                        className={`${
                            fillLike && "fill-current text-red-600"
                        } h-8 w-8`}
                        xmlns="http://www.w3.org/2000/svg"
                        x="0"
                        y="0"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 30">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                    </svg>
                    {votesCount}
                </button>

                {/*Share Button*/}
                {/*<button>*/}
                {/*    <svg*/}
                {/*        xmlns="http://www.w3.org/2000/svg"*/}
                {/*        x="0"*/}
                {/*        y="0"*/}
                {/*        fill="none"*/}
                {/*        stroke="currentColor"*/}
                {/*        strokeLinecap="round"*/}
                {/*        strokeLinejoin="round"*/}
                {/*        strokeWidth="2"*/}
                {/*        className="feather feather-log-out h-8 w-8 -rotate-90"*/}
                {/*        viewBox="0 0 24 30"*/}
                {/*    >*/}
                {/*        <path d="M10 22H5a2 2 0 01-2-2V4a2 2 0 012-2h5"></path>*/}
                {/*        <path d="M17 16L21 12 17 8"></path>*/}
                {/*        <path d="M21 12L9 12"></path>*/}
                {/*    </svg>*/}
                {/*</button>*/}
            </div>
            <div className="commentBox">
                <div className="mb-4 ml-1">
                    <form
                        onSubmit={async event => {
                            event.preventDefault(); // Prevent the default form submission behavior
                            await captureNewComment(comment); // Wait for comment to be captured and saved
                            // Additional actions after comment is saved can be added here
                        }}>
                        <input
                            type="text"
                            placeholder=" Add a reply..."
                            className={"comment-form"}
                            value={comment}
                            onChange={captureComment}
                            required
                        />
                        <input
                            class="bg-gray-200 ml-1 px-2 pt-1 pb-1.5 rounded "
                            type="submit"
                        />
                    </form>
                </div>
            </div>
            {replies.map(function (object) {
                return <Comments reply={object} />;
            })}
        </div>
    );
}

export default Post;
