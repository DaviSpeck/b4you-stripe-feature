import { useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { Chrome } from "react-feather";
import b4youLogo from "../../../assets/images/icons/b4you-logo-app.png";
import "../../../assets/scss/pages/notifications.scss";

export default function NotificationPreview({ title, content, url, image }) {
    const [activeTab, setActiveTab] = useState("compact");

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    const renderPreview = () => {
        switch (activeTab) {
            case "compact":
                return (
                    <div className="preview compact">
                        <img
                            src={b4youLogo}
                            alt="app"
                            className="app-icon"
                        />
                        <div className="text">
                            <strong>{title || "Título"}</strong>
                            <small className="subtitle">de B4You</small>
                            <p>{content || "Conteúdo da notificação"}</p>
                        </div>
                        <span className="time">agora</span>
                    </div>
                );

            case "expanded":
                return (
                    <div className="preview expanded">
                        {image && <img className="hero" src={image} alt="notification" />}
                        <div className="header">
                            <Chrome size={14} className="me-50" />
                            <span>Google Chrome · sandbox-dash.b4you.com.br</span>
                        </div>
                        <div className="body">
                            <img
                                src={b4youLogo}
                                alt="B4You"
                                className="app-icon"
                            />
                            <div className="text">
                                <strong>{title || "Título"}</strong>
                                <p>{content || "Conteúdo da notificação"}</p>
                                {url && <small className="url">{url}</small>}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="notification-preview">
            <Nav tabs>
                <NavItem>
                    <NavLink
                        className={classnames({ active: activeTab === "compact" })}
                        onClick={() => toggle("compact")}
                    >
                        Visualização Reduzida
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames({ active: activeTab === "expanded" })}
                        onClick={() => toggle("expanded")}
                    >
                        Visualização Ampliada
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab} className="mt-2">
                <TabPane tabId={activeTab}>{renderPreview()}</TabPane>
            </TabContent>
        </div>
    );
}