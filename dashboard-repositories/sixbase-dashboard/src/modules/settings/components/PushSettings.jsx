import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ButtonDS from "../../../jsx/components/design-system/ButtonDS";
import OneSignal from "react-onesignal";
import { notify } from "../../functions";
import { useUser } from "../../../providers/contextUser";
import { syncPlayerId } from "../../../services/oneSignalService";

const PushSettings = () => {
    const device_id = localStorage.getItem("device_id") || null;
    const { user } = useUser();
    const [pushEnabled, setPushEnabled] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const optedIn = OneSignal.User.PushSubscription.optedIn;
            setPushEnabled(!!optedIn);
        };

        const handleChange = (event) => {
            setPushEnabled(event.current.optedIn);
        };

        OneSignal.User.PushSubscription.addEventListener("change", handleChange);

        const timer = setTimeout(checkStatus, 1000);

        return () => {
            clearTimeout(timer);
            OneSignal.User.PushSubscription.removeEventListener("change", handleChange);
        };
    }, []);

    async function waitFor(condFn, label, timeout = 300000, interval = 250) {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            try {
                const ok = await condFn();
                if (ok) {
                    return ok;
                }
            } catch {
                // silencioso
            }
            await new Promise((r) => setTimeout(r, interval));
        }
        return null;
    }

    async function waitReady(uuid) {
        await waitFor(() => OneSignal.User.externalId === uuid, "externalId == uuid");

        await waitFor(() => {
            const id = OneSignal.User.onesignalId;
            return id && !String(id).startsWith("local-") ? id : null;
        }, "onesignalId não-local");

        await waitFor(() => {
            const t = OneSignal.User.PushSubscription?.token;
            return t ? t : null;
        }, "PushSubscription.token");
    }

    function getUserSnapshot() {
        const u = OneSignal.User;
        return {
            onesignalId: u.onesignalId,
            externalId: u.externalId,
            optedIn: u.PushSubscription?.optedIn,
            token: u.PushSubscription?.token,
        };
    }

    const togglePush = async () => {
        try {
            if (pushEnabled) {
                await OneSignal.User.PushSubscription.optOut();
                await OneSignal.logout();
                notify({
                    message: "Push Notification desativado com sucesso!",
                    type: "success",
                });
            } else {
                if (OneSignal.Notifications.permissionNative !== "granted") {
                    await OneSignal.Notifications.requestPermission();
                    if (OneSignal.Notifications.permissionNative !== "granted") {
                        notify({
                            message: "Permissão de notificações não concedida no navegador.",
                            type: "warning",
                        });
                        return;
                    }
                }

                await OneSignal.login(user.uuid);
                await OneSignal.User.PushSubscription.optIn();

                notify({
                    message: "Push Notification ativado com sucesso!",
                    type: "success",
                });

                await waitReady(user.uuid);

                const snap = getUserSnapshot();
                if (snap.onesignalId && snap.token) {
                    await syncPlayerId(snap.onesignalId, device_id);
                }
            }

            const status = OneSignal.User.PushSubscription.optedIn;
            setPushEnabled(!!status);
        } catch (err) {
            // console.error("[PushSettings] Erro no togglePush:", err);
        }
    };

    return (
        <Row className='mt-3 mb-4'>
            <Col>
                <ButtonDS
                    variant={pushEnabled ? "danger" : "success"}
                    size='sm'
                    onClick={togglePush}
                >
                    {pushEnabled
                        ? "Desativar Push Notification Web"
                        : "Ativar Push Notification Web"}
                </ButtonDS>
            </Col>
        </Row>
    );
};

export default PushSettings;