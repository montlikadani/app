import React, {Component, lazy, Suspense} from 'react';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import './DarkMode.css';
import './App.css';
import axios from "axios";
import {toast} from "react-toastify";
import Cookies from "js-cookie";

import ErrorView from "../../views/errors/error-view";
import AppContext from "../../context/app-context";
import LoadingSpinner from "../util/loading-spinner";
import {FaDizzy, FaExclamationCircle} from "react-icons/fa";
import {Row} from "react-bootstrap";
import {getSimpleRequestConfig} from "../util/utils";
import MaintenanceView from "../../views/maintenance-view";
import {retry} from "../util/lazy-init";
import OfflineErrorView from "../../views/errors/offline-error-view";

const ProfileView = lazy(() => retry(() => import("../../views/profile/profile-view")));
const CreateBoardView = lazy(() => retry(() => import("../../views/creator/create-board-view")));
const ModeratorInvitation = lazy(() => retry(() => import("../board/moderator-invitation")));
const BoardInvitation = lazy(() => retry(() => import("../board/board-invitation")));
const BoardView = lazy(() => retry(() => import("../../views/board-view")));
const AdminPanelView = lazy(() => retry(() => import("../../views/admin/admin-panel-view")));
const IdeaView = lazy(() => retry(() => import("../../views/idea-view")));
const OauthReceiver = lazy(() => retry(() => import("../../auth/oauth-receiver")));

toast.configure();

class App extends Component {

    CLIENT_VERSION = "0.1.0-beta";
    state = {
        session: Cookies.get("FSID"),
        search: {
            filter: localStorage.getItem("feedbacky_v1_filter"),
            sort: localStorage.getItem("feedbacky_v1_sort"),
        },
        serviceData: [],
        serviceDataLoaded: false,
        user: [],
        darkMode: (localStorage.getItem("feedbacky_v1_dark_mode") === 'true'),
        moderates: [],
        loggedIn: false,
        loaded: false,
        error: false,
        moderatingDataLoaded: false,
        theme: "#343a40",
        apiRoute: (process.env.REACT_APP_SERVER_IP_ADDRESS || "http://185.238.72.89:8090") + "/api/v1",
    };

    componentDidMount() {
        if (this.state.darkMode) {
            document.body.classList.add("dark");
        } else if (localStorage.getItem("feedbacky_v1_dark_mode") == null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setState({darkMode: true});
            document.body.classList.add("dark");
            localStorage.setItem("feedbacky_v1_dark_mode", "true");
        }
        if (this.state.loaded && this.state.moderatingDataLoaded && this.state.serviceDataLoaded) {
            return;
        }
        if (!this.state.serviceDataLoaded) {
            axios.get(this.state.apiRoute + "/service/about").then(res => {
                this.setState({serviceData: res.data, serviceDataLoaded: true});
            }).catch(() => this.setState({error: true, serviceData: [], serviceDataLoaded: true}));
        }
        if (this.state.session == null) {
            this.setState({loaded: true, moderatingDataLoaded: true});
            return;
        }
        axios.get(this.state.apiRoute + "/users/@me", getSimpleRequestConfig(this.state.session)).then(res => {
            const user = res.data;
            axios.get(this.state.apiRoute + "/users/@me/permissions", getSimpleRequestConfig(this.state.session))
                .then(response => {
                    const moderates = response.data;
                    this.setState({moderates, moderatingDataLoaded: true});
                }).catch(() => this.setState({/* ignore fails */ moderatingDataLoaded: true}));
            this.setState({user, loggedIn: true, loaded: true});
        }).catch(err => {
            if (err.response === undefined || err.response.status === 401 || err.response.status === 403 || (err.response.status >= 500 && err.response.status <= 599)) {
                this.setState({error: false, loaded: true, loggedIn: false, moderatingDataLoaded: true});
                return;
            }
            this.setState({error: true, loaded: true, moderatingDataLoaded: true});
        });
    }

    onLogin = (token) => {
        //setting loaded to false because it was already loaded before this method call
        this.setState({session: token, loaded: false, serviceDataLoaded: false, moderatingDataLoaded: false});
        //forcing reupdate the props
        this.componentDidMount();
    };

    onLogOut = () => {
        Cookies.remove("FSID");
        this.setState({session: null, user: [], moderates: [], loggedIn: false});
        this.componentDidMount();
    };

    onFilteringUpdate = (filterType, boardData, moderatorsData, history, discriminator) => {
        localStorage.setItem("feedbacky_v1_filter", filterType);
        this.setState({
            search: {
                ...this.state.search,
                filter: filterType,
            },
        });
        this.boardRedirect(history, boardData, moderatorsData, discriminator);
    };

    onSortingUpdate = (sortingType, boardData, moderatorsData, history, discriminator) => {
        localStorage.setItem("feedbacky_v1_sort", sortingType);
        this.setState({
            search: {
                ...this.state.search,
                sort: sortingType,
            }
        });
        this.boardRedirect(history, boardData, moderatorsData, discriminator);
    };

    boardRedirect = (history, boardData, moderatorsData, discriminator) => {
        history.push({
            pathname: "/brdr/" + discriminator,
            state: {
                _boardData: boardData,
                _moderators: moderatorsData,
            },
        });
    };

    onDarkModeToggle = () => {
        let darkMode = (localStorage.getItem("feedbacky_v1_dark_mode") === 'true');
        if (darkMode) {
            localStorage.setItem("feedbacky_v1_dark_mode", "false");
            document.body.classList.remove("dark");
            this.setState({darkMode: false});
        } else {
            localStorage.setItem("feedbacky_v1_dark_mode", "true");
            document.body.classList.add("dark");
            this.setState({darkMode: true});
        }
    };

    render() {
        if (this.state.error) {
            return <BrowserRouter><OfflineErrorView iconMd={<FaDizzy style={{fontSize: 250, color: "#2c3e50"}}/>}
                                                    iconSm={<FaDizzy style={{fontSize: 180, color: "#2c3e50"}}/>} message="Service Is Unavailable, try again in a while"/></BrowserRouter>
        }
        if (!this.state.loaded || !this.state.moderatingDataLoaded || !this.state.serviceDataLoaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
        }
        if (this.state.serviceData.maintenanceMode) {
            return <BrowserRouter><MaintenanceView/></BrowserRouter>
        }
        return <AppContext.Provider value={{
            apiRoute: this.state.apiRoute,
            user: {
                data: this.state.user, loggedIn: this.state.loggedIn, session: this.state.session, moderates: this.state.moderates,
                searchPreferences: this.state.search, darkMode: this.state.darkMode, onLogOut: this.onLogOut,
            },
            serviceData: this.state.serviceData,
            onFilteringUpdate: this.onFilteringUpdate, onSortingUpdate: this.onSortingUpdate, onDarkModeToggle: this.onDarkModeToggle,
            theme: this.state.theme, onThemeChange: theme => this.setState({theme}),
        }}>
            <Suspense fallback={<Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>}>
                <Switch>
                    <Route exact path="/" component={ProfileView}/>
                    <Route exact path="/admin/create" component={CreateBoardView}/>
                    <Route path="/merdr/:section" render={(props) =>
                        <Redirect to={{
                            pathname: "/me/" + props.match.params.section,
                            state: props.location.state,
                        }}/>}/>
                    <Route path="/me/:section" component={ProfileView}/>
                    <Route path="/me/" component={ProfileView}/>
                    <Route path="/moderator_invitation/:code" component={ModeratorInvitation}/>
                    <Route path="/invitation/:code" component={BoardInvitation}/>
                    <Route path="/b/:id" component={BoardView}/>
                    {/* sneaky way to redirect from /b/ to /b/ but with different :id parameters, because it doesn't work */}
                    <Route path="/brdr/:id" render={(props) =>
                        <Redirect to={{
                            pathname: "/b/" + props.match.params.id,
                            state: props.location.state,
                        }}/>}/>
                    <Route path="/ba/:id" component={AdminPanelView}/>
                    <Route path="/bardr/:id/:section" render={(props) =>
                        <Redirect to={{
                            pathname: "/ba/" + props.match.params.id + "/" + props.match.params.section,
                            state: props.location.state,
                        }}/>}/>
                    <Route path="/i/:id" component={IdeaView}/>
                    <Route path="/auth/:provider" render={(props) => <OauthReceiver onLogin={this.onLogin} {...props}/>}/>
                    <Route render={() => <ErrorView iconMd={<FaExclamationCircle style={{fontSize: 250, color: "#c0392b"}}/>}
                                                    iconSm={<FaExclamationCircle style={{fontSize: 180, color: "#c0392b"}}/>} message="Content Not Found"/>}/>
                </Switch>
            </Suspense>
        </AppContext.Provider>
    }
}

export default App;
