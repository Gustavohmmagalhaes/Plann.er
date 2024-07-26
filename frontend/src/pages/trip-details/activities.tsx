import { format, parseISO, isValid } from "date-fns";
import { Activity, CircleCheck } from "lucide-react";
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import { useParams } from "react-router-dom";

interface Activity {
    date: string;
    activities: {
        id: string;
        title: string;
        occurs_at: string;
    }[];
}

export function Activities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const { tripId } = useParams();

    useEffect(() => {
        api.get(`/trips/${tripId}/activities`).then(response => setActivities(response.data.activities));
    }, [tripId]);

    return (
        <div className="space-y-8">
            {activities.map(category => {
                const categoryDate = parseISO(category.date);
                return (
                    <div key={category.date} className="space-y-2.5">
                        {isValid(categoryDate) ? (
                            <div className="flex gap-2 items-baseline">
                                <span className="text-xl text-zinc-300">Dia {format(categoryDate, 'd')}</span>
                                <span className="text-xs text-zinc-500">{format(categoryDate, 'EEE', { locale: ptBR })}</span>
                            </div>
                        ) : (
                            <p className="text-red-500">Data de categoria inválida.</p>
                        )}
                        {category.activities.length > 0 ? (
                            <div>
                                {category.activities.map(activity => {
                                    const activityDate = parseISO(activity.occurs_at);
                                    return (
                                        <div key={activity.id} className="space-y-2.5">
                                            <div className="px-4 py-2.5 bg-zinc-900 rounded-xl shadow-shape flex items-center gap-3">
                                                <CircleCheck className="size-5 text-lime-300" />
                                                <span className="text-zinc-100">{activity.title}</span>
                                                {isValid(activityDate) ? (
                                                    <span className="text-zinc-400 text-sm ml-auto">{format(activityDate, 'HH:mm')}h</span>
                                                ) : (
                                                    <span className="text-red-500 text-sm ml-auto">Data de atividade inválida.</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm">Nenhuma atividade cadastrada nessa data.</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
