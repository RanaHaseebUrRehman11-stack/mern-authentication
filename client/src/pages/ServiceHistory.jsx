import { useEffect, useState } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Spinner, Alert, EmptyState } from "../components/ui/Feedback";
import StatusBadge from "../components/ui/StatusBadge";
import { Table } from "../components/ui/Table";

function ServiceHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const { data } = await api.get("/service-requests/history");
                if (!active) return;
                setHistory(data.history || []);
            } catch (err) {
                if (!active) return;
                setError(
                    err.response?.data?.message ||
                        "Unable to load your service history."
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Service History</h1>
                    <p className="page-subtitle">
                        Your completed service requests.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            <Card>
                {loading ? (
                    <Spinner />
                ) : history.length === 0 ? (
                    <EmptyState
                        title="No completed services"
                        message="Completed service requests will appear here."
                    />
                ) : (
                    <Table
                        columns={[
                            "Service",
                            "Vehicle",
                            "Mechanic",
                            "Status",
                            "Completed"
                        ]}
                    >
                        {history.map((item) => (
                            <tr key={item._id}>
                                <td>{item.serviceType}</td>
                                <td>
                                    {item.vehicle?.vehicleNumber || "—"}
                                </td>
                                <td>{item.mechanic?.name || "—"}</td>
                                <td>
                                    <StatusBadge status={item.status} />
                                </td>
                                <td>
                                    {new Date(
                                        item.updatedAt
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
        </div>
    );
}

export default ServiceHistory;
