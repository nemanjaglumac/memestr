import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import getUserDetailsFromPrivateKey from "../Profile";
import { getPublicKey, nip19 } from "nostr-tools";

function LoginModal({ isOpen, onClose }) {
    const [loggedInUserDetails, setLoggedInUserDetails] = useState({});
    const [privateKey, setPrivateKey] = useState("");
    function handlePrivateKeyChange(event) {
        setPrivateKey(event.target.value);
    }

    function logUserIn() {
        let userDetails = null;
        const storedData = localStorage.getItem("memestr");
        if (storedData) {
            userDetails = JSON.parse(storedData);
            const display_name = userDetails.display_name;
            const name = userDetails.name;
            const profile_picture = userDetails.picture;
            setLoggedInUserDetails({
                display_name: display_name,
                picture: profile_picture,
                name: name,
            });
        } else {
            userDetails = getUserDetailsFromPrivateKey(privateKey);
            userDetails.then(value => {
                const display_name = value.display_name;
                const profile_picture = value.picture;
                const name = value.name;
                setLoggedInUserDetails({
                    display_name: display_name,
                    picture: profile_picture,
                    name: name,
                });
                let decodedpk = nip19.decode(privateKey);
                let publicKey = getPublicKey(decodedpk.data);
                value["pubKey"] = publicKey;
                value["privateKey"] = privateKey; //Encrypt it.
                localStorage.setItem("memestr", JSON.stringify(value));
                console.log("Calling on close method.", loggedInUserDetails);
            });
        }
    }

    useEffect(() => {
        if (Object.keys(loggedInUserDetails).length !== 0) {
            onClose(loggedInUserDetails);
        }
    }, [onClose, loggedInUserDetails]);

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                onClose={() => {
                    onClose(loggedInUserDetails);
                }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-10">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-hidden">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-base font-semibold leading-6 text-gray-900 pb-6">
                                                Login
                                            </Dialog.Title>

                                            <Dialog.Description>
                                                <div class="mb-4">
                                                    <label
                                                        htmlFor="loginKey"
                                                        className="flex justify-start block mb-1 text-sm font-medium text-gray-900 dark:text-black">
                                                        Nsec Key:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="loginKey"
                                                        onChange={
                                                            handlePrivateKeyChange
                                                        }
                                                        value={privateKey}
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        placeholder="Guy_who_farted"
                                                        required
                                                    />
                                                </div>
                                            </Dialog.Description>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className="mt-2 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => {
                                            logUserIn();
                                        }}>
                                        Login
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

export default LoginModal;
