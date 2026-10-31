import { useEffect, useState } from "react";
import { CheckCircle2, History, Wrench } from "lucide-react";

import api from "../services/api";
import { Card } from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
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
            <PageHeader
                eyebrow="Records"
                title="Service History"
                subtitle="Your completed service requests."
                actions={
                    <span className="header-chip">
                        <CheckCircle2
                            size={15}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        {history.length} completed
                    </span>
                }
            />

            <Alert type="error">{error}</Alert>

            <Card
                title="Completed Services"
                subtitle="A permanent record for every vehicle"
                icon={History}
            >
                {loading ? (
                    <Spinner />
                ) : history.length === 0 ? (
                    <EmptyState
                        title="No completed services"
                        message="Completed service requests will appear here."
                        icon={History}
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
                                <td>
                                    <div className="table-primary">
                                        <span className="list-avatar">
                                            <Wrench
                                                size={15}
                                                strokeWidth={1.9}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="list-title">
                                            {item.serviceType}
                                        </span>
                                    </div>
                                </td>
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
