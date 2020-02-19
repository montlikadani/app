import React, {useContext} from 'react';
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {getSimpleRequestConfig, toastError, toastSuccess} from "../util/Utils";
import AppContext from "../../context/AppContext";

const InvitationModal = (props) => {
    const context = useContext(AppContext);

    const handleSubmit = () => {
        const userEmail = document.getElementById("inviteEmailTextarea").value;
        axios.post(context.apiRoute + "/boards/" + props.data.discriminator + "/invitations", {
            userEmail,
        }, getSimpleRequestConfig(props.session)).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            props.onInvitationCreateModalClose();
            props.onInvitationSend(res.data);
            toastSuccess("Invitation for user " + res.data.user.username + " sent.");
        }).catch(err => {
            toastError(err.response.data.errors[0]);
        });
    };

    return <Modal id="inviteModal" show={props.open} onHide={props.onInvitationCreateModalClose}>
        <Modal.Header className="text-center pb-0" style={{display: "block", borderBottom: "none"}}>
            <Modal.Title><h5 className="modal-title">Invite New User</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-1">
            <Form noValidate>
                <Form.Group className="mt-2 mb-1">
                    <Form.Label className="mr-1 text-black-60">User Email</Form.Label>
                    <Form.Control style={{borderColor: context.theme + "66", maxHeight: 38, resize: "none"}} rows="1" required type="email"
                                  placeholder="Existing user email." id="inviteEmailTextarea"/>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer style={{borderTop: "none"}} className="pt-2">
            <Button variant="link" className="m-0 btn-smaller text-black-60" onClick={props.onInvitationCreateModalClose}>
                Cancel
            </Button>
            <Button variant="" type="submit" style={{backgroundColor: context.theme}}
                    onClick={handleSubmit} className="btn-smaller text-white">
                Invite
            </Button>
        </Modal.Footer>
    </Modal>
};

export default InvitationModal;