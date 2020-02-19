import React, {Component} from 'react';
import AppContext from "../../../context/AppContext";
import {Button, Col, OverlayTrigger, Popover, Row, Tooltip} from "react-bootstrap";
import axios from "axios";
import LoadingSpinner from "../../../components/util/LoadingSpinner";
import {FaQuestionCircle, FaTrashAlt} from "react-icons/fa";
import {getSimpleRequestConfig, getSizedAvatarByUrl, toastError, toastSuccess} from "../../../components/util/Utils";
import InvitationModal from "../../../components/modal/InvitationModal";
import copy from "copy-text-to-clipboard";
import AdminSidebar from "../../../components/sidebar/AdminSidebar";
import {popupSwal} from "../../../components/util/SwalUtils";

class Invitations extends Component {

    static contextType = AppContext;

    state = {
        data: [],
        loaded: false,
        error: false,
        modalOpened: false,
        invitedData: [],
        invitedLoaded: false,
        invitedError: false,
    };

    onInvitationCreateModalClick = () => {
        this.setState({modalOpened: true});
    };

    onInvitationCreateModalClose = () => {
        this.setState({modalOpened: false});
    };

    componentDidMount() {
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/invitations", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({error: true});
                return;
            }
            const data = res.data;
            this.setState({data, loaded: true});
        }).catch(() => {
            this.setState({error: true});
        });
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/invitedUsers", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({invitedError: true});
                return;
            }
            const invitedData = res.data;
            this.setState({invitedData, invitedLoaded: true});
        }).catch(() => {
            this.setState({invitedError: true});
        });
    }

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="invitations" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col className="mt-4">
                <h2 className="h2-responsive mb-3">Invitations</h2>
                {this.renderContent()}
            </Col>
        </React.Fragment>
    }

    renderContent() {
        if (!this.props.data.privatePage) {
            return <Col className="mb-3 px-0">
                <h2 className="h2-responsive text-danger">Feature Disabled</h2>
                <span><kbd>Private Board</kbd> option is disabled so you can't manage board invitations.
                    <br/>Enable it in <kbd>General</kbd> section to manage pending invitations and invited users.
                </span>
            </Col>
        }
        if (this.state.error) {
            return <span className="text-danger">Failed to obtain invitations data</span>
        }
        if (!this.state.loaded) {
            return <Row className="mt-4 ml-2"><LoadingSpinner/></Row>
        }
        return <React.Fragment>
            <InvitationModal onInvitationSend={this.onInvitationSend} onInvitationCreateModalClose={this.onInvitationCreateModalClose} data={this.props.data} session={this.context.user.session} open={this.state.modalOpened}/>
            <Row className="m-0 p-4 rounded box-overlay">
                <Col sm={6} className="px-1 mb-sm-0 mb-4">
                    <span className="mr-1 text-black-60">Pending Invitations</span>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="boardPendingPopover">
                                <Popover.Title as="h3">Pending Invitations</Popover.Title>
                                <Popover.Content>
                                    Users whose invitations were not yet accepted.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    {this.renderInvitations()}
                    <div>
                        <Button className="btn-smaller text-white m-0 mt-3" variant="" style={{backgroundColor: this.context.theme}} onClick={this.onInvitationCreateModalClick}>Invite New</Button>
                    </div>
                </Col>
                <Col sm={6} className="px-1">
                    <span className="mr-1 text-black-60">Invited Members</span>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="boardInvitedPopover">
                                <Popover.Title as="h3">Invited Members</Popover.Title>
                                <Popover.Content>
                                    Users who accepted invitation and can see your board.
                                    Can be kicked any time.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    {this.renderInvited()}
                </Col>
            </Row>
        </React.Fragment>
    }

    renderInvitations() {
        return this.state.data.map((invite, i) => {
            return <div className="my-1" key={i}>
                <img className="img-responsive rounded mr-1 m"
                     src={getSizedAvatarByUrl(invite.user.avatar, 32)}
                     onError={(e) => e.target.src = "https://cdn.feedbacky.net/static/img/default_avatar.png"}
                     alt="avatar"
                     height="24px" width="24px"/>
                {invite.user.username}
                {" - "}
                <a href="#!" className="text-black-60" onClick={() => {
                    copy("https://app.feedbacky.net/invitation/" + invite.code);
                    toastSuccess("Copied to clipboard.")
                }}>Copy Invite</a>
                <OverlayTrigger overlay={<Tooltip id={"deleteInvite" + i + "-tooltip"}>Invalidate</Tooltip>}>
                    <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onInvalidation(invite.id)}/>
                </OverlayTrigger>
            </div>
        });
    }

    renderInvited() {
        return this.state.invitedData.map((user, i) => {
            return <div className="my-1" key={i}>
                <img className="img-responsive rounded mr-1"
                     src={getSizedAvatarByUrl(user.avatar, 32)}
                     onError={(e) => e.target.src = "https://cdn.feedbacky.net/static/img/default_avatar.png"}
                     alt="avatar"
                     height="24px" width="24px"/>
                {user.username}
                <OverlayTrigger overlay={<Tooltip id={"deleteInvite" + i + "-tooltip"}>Kick Out from Board</Tooltip>}>
                    <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onKick(user.id)}/>
                </OverlayTrigger>
            </div>
        });
    }

    onKick = (id) => {
        popupSwal("warning", "Dangerous action", "User will no longer be able to see this board.",
            "Delete Invite", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/invitedUsers/" + id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const invitedData = this.state.invitedData.filter(item => item.id !== id);
                    this.setState({invitedData});
                    toastSuccess("Invitation removed.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

    onInvitationSend = (inviteData) => {
        const data = this.state.data.concat(inviteData);
        this.setState({data});
    };

    onInvalidation = (id) => {
        popupSwal("warning", "Dangerous action", "User will no longer be able to join the board with this invitation.",
            "Delete Invite", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/invitations/" + id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = this.state.data.filter(item => item.id !== id);
                    this.setState({data});
                    toastSuccess("Invitation removed.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

}

export default Invitations;