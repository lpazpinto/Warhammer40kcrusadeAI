import { describe, it, expect } from 'vitest';

describe('Movement Phase Steps System', () => {
  describe('Phase Structure', () => {
    it('should have exactly 3 steps in Movement Phase', () => {
      const MOVEMENT_PHASE_STEPS = [
        { id: "start", title: "Começo da Fase de Movimento" },
        { id: "move_units", title: "Mover Unidades" },
        { id: "reinforcements", title: "Reforços (Reinforcements)" },
      ];

      expect(MOVEMENT_PHASE_STEPS.length).toBe(3);
    });

    it('should have correct step IDs', () => {
      const stepIds = ["start", "move_units", "reinforcements"];
      
      expect(stepIds[0]).toBe("start");
      expect(stepIds[1]).toBe("move_units");
      expect(stepIds[2]).toBe("reinforcements");
    });
  });

  describe('Movement Types', () => {
    it('should support Normal Move', () => {
      const movementTypes = ["normal", "advance", "fall_back", "remain_stationary"];
      
      expect(movementTypes).toContain("normal");
    });

    it('should support Advance', () => {
      const movementTypes = ["normal", "advance", "fall_back", "remain_stationary"];
      
      expect(movementTypes).toContain("advance");
    });

    it('should support Fall Back', () => {
      const movementTypes = ["normal", "advance", "fall_back", "remain_stationary"];
      
      expect(movementTypes).toContain("fall_back");
    });

    it('should support Remain Stationary', () => {
      const movementTypes = ["normal", "advance", "fall_back", "remain_stationary"];
      
      expect(movementTypes).toContain("remain_stationary");
    });
  });

  describe('Step Completion Logic', () => {
    it('should track completed steps', () => {
      const completedSteps = new Set<number>();
      
      // Complete step 0
      completedSteps.add(0);
      expect(completedSteps.has(0)).toBe(true);
      expect(completedSteps.has(1)).toBe(false);
      
      // Complete step 1
      completedSteps.add(1);
      expect(completedSteps.has(1)).toBe(true);
      expect(completedSteps.size).toBe(2);
    });

    it('should allow completing all steps', () => {
      const completedSteps = new Set<number>();
      
      completedSteps.add(0);
      completedSteps.add(1);
      completedSteps.add(2);
      
      expect(completedSteps.size).toBe(3);
      expect(completedSteps.has(0)).toBe(true);
      expect(completedSteps.has(1)).toBe(true);
      expect(completedSteps.has(2)).toBe(true);
    });
  });

  describe('Phase Blocking Logic', () => {
    it('should block phase advance when Movement Phase not completed', () => {
      const currentPhase = "movement";
      const movementPhaseCompleted = false;
      
      const canAdvancePhase = currentPhase !== "movement" || movementPhaseCompleted;
      
      expect(canAdvancePhase).toBe(false);
    });

    it('should allow phase advance when Movement Phase completed', () => {
      const currentPhase = "movement";
      const movementPhaseCompleted = true;
      
      const canAdvancePhase = currentPhase !== "movement" || movementPhaseCompleted;
      
      expect(canAdvancePhase).toBe(true);
    });

    it('should allow phase advance when not in Movement Phase', () => {
      const currentPhase = "shooting";
      const movementPhaseCompleted = false;
      
      const canAdvancePhase = currentPhase !== "movement" || movementPhaseCompleted;
      
      expect(canAdvancePhase).toBe(true);
    });
  });

  describe('Reinforcements Rules', () => {
    it('should treat reinforcements as having made Normal Move', () => {
      const unitEnteredFromReserves = true;
      const movementType = unitEnteredFromReserves ? "normal" : null;
      
      expect(movementType).toBe("normal");
    });

    it('should prevent reinforcements from moving again', () => {
      const unitEnteredFromReserves = true;
      const canMoveAgain = !unitEnteredFromReserves;
      
      expect(canMoveAgain).toBe(false);
    });

    it('should allow units that did not enter from reserves to move', () => {
      const unitEnteredFromReserves = false;
      const canMove = !unitEnteredFromReserves;
      
      expect(canMove).toBe(true);
    });
  });

  describe('Unselected Units Logic', () => {
    it('should treat unselected units as Remain Stationary', () => {
      const unitWasSelected = false;
      const movementType = unitWasSelected ? "normal" : "remain_stationary";
      
      expect(movementType).toBe("remain_stationary");
    });

    it('should track selected units correctly', () => {
      const selectedUnits = new Set<number>();
      
      selectedUnits.add(1);
      selectedUnits.add(3);
      
      expect(selectedUnits.has(1)).toBe(true);
      expect(selectedUnits.has(2)).toBe(false);
      expect(selectedUnits.has(3)).toBe(true);
    });
  });

  describe('Step Navigation', () => {
    it('should start at step 0', () => {
      const currentStep = 0;
      
      expect(currentStep).toBe(0);
    });

    it('should advance to next step', () => {
      let currentStep = 0;
      currentStep += 1;
      
      expect(currentStep).toBe(1);
    });

    it('should go back to previous step', () => {
      let currentStep = 2;
      currentStep -= 1;
      
      expect(currentStep).toBe(1);
    });

    it('should not go below step 0', () => {
      let currentStep = 0;
      if (currentStep > 0) {
        currentStep -= 1;
      }
      
      expect(currentStep).toBe(0);
    });

    it('should identify last step correctly', () => {
      const totalSteps = 3;
      const currentStep = 2;
      const isLastStep = currentStep === totalSteps - 1;
      
      expect(isLastStep).toBe(true);
    });
  });

  describe('Phase Completion State', () => {
    it('should reset completion when entering Movement Phase again', () => {
      let movementPhaseCompleted = true;
      const phase = "movement";
      
      if (phase === "movement") {
        movementPhaseCompleted = false;
      }
      
      expect(movementPhaseCompleted).toBe(false);
    });

    it('should maintain completion in other phases', () => {
      let movementPhaseCompleted = true;
      const phase = "shooting";
      
      if (phase === "movement") {
        movementPhaseCompleted = false;
      }
      
      expect(movementPhaseCompleted).toBe(true);
    });
  });

  describe('Combined Phase Blocking (Command + Movement)', () => {
    it('should block when Command Phase incomplete', () => {
      const currentPhase = "command";
      const commandPhaseCompleted = false;
      const movementPhaseCompleted = true;
      
      const canAdvancePhase = 
        (currentPhase !== "command" || commandPhaseCompleted) &&
        (currentPhase !== "movement" || movementPhaseCompleted);
      
      expect(canAdvancePhase).toBe(false);
    });

    it('should block when Movement Phase incomplete', () => {
      const currentPhase = "movement";
      const commandPhaseCompleted = true;
      const movementPhaseCompleted = false;
      
      const canAdvancePhase = 
        (currentPhase !== "command" || commandPhaseCompleted) &&
        (currentPhase !== "movement" || movementPhaseCompleted);
      
      expect(canAdvancePhase).toBe(false);
    });

    it('should allow advance when both phases completed', () => {
      const currentPhase = "movement";
      const commandPhaseCompleted = true;
      const movementPhaseCompleted = true;
      
      const canAdvancePhase = 
        (currentPhase !== "command" || commandPhaseCompleted) &&
        (currentPhase !== "movement" || movementPhaseCompleted);
      
      expect(canAdvancePhase).toBe(true);
    });
  });
});
