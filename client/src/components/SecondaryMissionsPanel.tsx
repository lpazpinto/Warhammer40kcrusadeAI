/**
 * SecondaryMissionsPanel - Displays active Secondary Missions during battle
 * Secondary Missions provide additional objectives with rewards and punishments
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Target, Eye, Shuffle, CheckCircle2, XCircle, Trophy, Skull } from "lucide-react";
import { 
  SECONDARY_MISSIONS, 
  SecondaryMission, 
  drawSecondaryMissions 
} from "@shared/secondaryMissions";

interface ActiveMission {
  missionId: number;
  status: 'active' | 'completed' | 'failed';
  progress?: string;
}

interface SecondaryMissionsPanelProps {
  /** Currently active missions with their status */
  activeMissions: ActiveMission[];
  /** Callback when missions are drawn */
  onDrawMissions?: (missions: SecondaryMission[]) => void;
  /** Callback when a mission is completed */
  onCompleteMission?: (missionId: number) => void;
  /** Callback when a mission fails */
  onFailMission?: (missionId: number) => void;
  /** Current battle round */
  battleRound: number;
  /** Whether to show draw button */
  showDrawButton?: boolean;
  /** Number of missions to draw by default */
  defaultDrawCount?: number;
}

export default function SecondaryMissionsPanel({
  activeMissions,
  onDrawMissions,
  onCompleteMission,
  onFailMission,
  battleRound,
  showDrawButton = true,
  defaultDrawCount = 1,
}: SecondaryMissionsPanelProps) {
  const [selectedMission, setSelectedMission] = useState<SecondaryMission | null>(null);
  const [showAllMissions, setShowAllMissions] = useState(false);

  // Get mission data from IDs
  const getMissionData = (missionId: number): SecondaryMission | undefined => {
    return SECONDARY_MISSIONS.find(m => m.id === missionId);
  };

  // Handle drawing new missions
  const handleDrawMissions = () => {
    const excludeIds = activeMissions.map(m => m.missionId);
    const newMissions = drawSecondaryMissions(defaultDrawCount, battleRound, excludeIds);
    onDrawMissions?.(newMissions);
  };

  // Get status color
  const getStatusColor = (status: ActiveMission['status']): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
    }
  };

  // Get status label
  const getStatusLabel = (status: ActiveMission['status']): string => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'failed':
        return 'Falhou';
      default:
        return 'Ativa';
    }
  };

  // Get tag color
  const getTagColor = (tag: SecondaryMission['tags'][number]): string => {
    switch (tag) {
      case 'sp_reward':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'spawn_modifier':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'misery_punishment':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'action':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'combat':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'objective':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'purchase':
        return 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  // Get tag label in Portuguese
  const getTagLabel = (tag: SecondaryMission['tags'][number]): string => {
    switch (tag) {
      case 'sp_reward':
        return 'Recompensa SP';
      case 'spawn_modifier':
        return 'Mod. Geração';
      case 'misery_punishment':
        return 'Punição Miséria';
      case 'action':
        return 'Ação';
      case 'combat':
        return 'Combate';
      case 'objective':
        return 'Objetivo';
      case 'purchase':
        return 'Compra';
      default:
        return tag;
    }
  };

  const activeCount = activeMissions.filter(m => m.status === 'active').length;

  return (
    <>
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="h-5 w-5" />
              Missões Secundárias
              {activeCount > 0 && (
                <Badge variant="default" className="ml-2 bg-blue-600">
                  {activeCount} Ativa{activeCount > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllMissions(true)}
                className="text-blue-700 hover:text-blue-800 hover:bg-blue-100"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Todas
              </Button>
              {showDrawButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDrawMissions}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  Comprar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeMissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma Missão Secundária ativa neste round.
            </p>
          ) : (
            <div className="space-y-3">
              {activeMissions.map(activeMission => {
                const mission = getMissionData(activeMission.missionId);
                if (!mission) return null;

                return (
                  <div
                    key={mission.id}
                    className={`bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow ${
                      activeMission.status === 'completed' 
                        ? 'border-green-300 bg-green-50/50' 
                        : activeMission.status === 'failed'
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-blue-200'
                    }`}
                    onClick={() => setSelectedMission(mission)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-blue-800">
                            #{mission.id} - {mission.namePt}
                          </span>
                          <Badge
                            variant="outline"
                            className={getStatusColor(activeMission.status)}
                          >
                            {getStatusLabel(activeMission.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {mission.conditionPt}
                        </p>
                        {activeMission.progress && (
                          <p className="text-xs text-blue-600 mt-1">
                            Progresso: {activeMission.progress}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mission.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className={`text-xs ${getTagColor(tag)}`}
                            >
                              {getTagLabel(tag)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {activeMission.status === 'active' && (
                        <div className="flex flex-col gap-1 ml-2">
                          {onCompleteMission && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCompleteMission(mission.id);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-100"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {onFailMission && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFailMission(mission.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mission Detail Dialog */}
      <Dialog open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-800">
              <Target className="h-5 w-5" />
              #{selectedMission?.id} - {selectedMission?.namePt}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {selectedMission?.nameEn}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Condição:</h4>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                {selectedMission?.conditionPt}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  Recompensa:
                </h4>
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                  {selectedMission?.rewardPt}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-red-700 mb-2 flex items-center gap-1">
                  <Skull className="h-4 w-4" />
                  Punição:
                </h4>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  {selectedMission?.punishmentPt}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMission?.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={getTagColor(tag)}
                >
                  {getTagLabel(tag)}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Missions Reference Dialog */}
      <Dialog open={showAllMissions} onOpenChange={setShowAllMissions}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Todas as Missões Secundárias (20)
            </DialogTitle>
            <DialogDescription>
              Referência completa de todas as Missões Secundárias do Horde Mode
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {SECONDARY_MISSIONS.map(mission => {
              const activeMission = activeMissions.find(m => m.missionId === mission.id);
              return (
                <div
                  key={mission.id}
                  className={`p-3 rounded-lg border ${
                    activeMission
                      ? activeMission.status === 'completed'
                        ? 'bg-green-100 border-green-300'
                        : activeMission.status === 'failed'
                        ? 'bg-red-100 border-red-300'
                        : 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-sm">
                      #{mission.id} - {mission.namePt}
                    </span>
                    {activeMission && (
                      <Badge 
                        variant={
                          activeMission.status === 'completed' 
                            ? 'default' 
                            : activeMission.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {getStatusLabel(activeMission.status)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {mission.conditionPt}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">✓ {mission.rewardPt.split(',')[0]}</span>
                    <span className="text-red-600">✗ {mission.punishmentPt.split(',')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
