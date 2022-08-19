import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

class CustomStamina implements IPostDBLoadMod
{
    private config = require("../config/config.json");

    public postDBLoad(container: DependencyContainer): void 
    {
        // Get the logger from the server container.
        const logger = container.resolve<ILogger>("WinstonLogger");

        // Check to see if the mod is enabled.
        const enabled:boolean = this.config.mod_enabled;
        if (!enabled)
        {
            logger.info("CustomStamina is disabled in the config file. No changes to stamina will be made.");
            return;
        }

        // Verbose logging?
        const debug:boolean = this.config.debug;

        // Get database from server.
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get in-memory stamina configuration data.
        const stamina = databaseServer.getTables().globals.config.Stamina;
        
        if (this.config.adjustment_method === "unlimited")
        {
            stamina.AimConsumptionByPose.x = 0;
            stamina.AimConsumptionByPose.y = 0;
            stamina.AimConsumptionByPose.z = 0;
            stamina.AimDrainRate = 0;
            stamina.AimRangeFinderDrainRate = 0;
            stamina.BaseHoldBreathConsumption = 0;
            stamina.BaseRestorationRate = 500;
            stamina.Capacity = 500;
            stamina.CrouchConsumption.x = 0; // consumption moving while crouched?
            stamina.CrouchConsumption.y = 0; 
            stamina.GrenadeHighThrow = 0;
            stamina.GrenadeLowThrow = 0;
            stamina.HoldBreathStaminaMultiplier.x = 0;
            stamina.HoldBreathStaminaMultiplier.y = 0;
            stamina.HandsCapacity = 500;
            stamina.HandsRestoration = 500;
            stamina.JumpConsumption = 0;
            stamina.OxygenCapacity = 500;
            stamina.OxygenRestoration = 500;
            stamina.PoseLevelConsumptionPerNotch.x = 0; // consumption raising crouch/pose level
            stamina.PoseLevelConsumptionPerNotch.y = 0;
            stamina.ProneConsumption = 0;
            stamina.SitToStandConsumption = 0;
            stamina.SprintDrainRate = 0;
            stamina.StaminaExhaustionCausesJiggle = false;
            stamina.StaminaExhaustionRocksCamera = false;
            stamina.StaminaExhaustionStartsBreathSound = false;
            stamina.StandupConsumption.x = 0; // consumption standing up from prone
            stamina.StandupConsumption.y = 0;
            stamina.WalkConsumption.x = 0;
            stamina.WalkConsumption.y = 0;

            logger.info("CustomStamina: All breath, leg, and hand stamina settings have been set to unlimited.");
        }
        else if (this.config.adjustment_method === "percent")
        {
            stamina.AimConsumptionByPose.x = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.AimConsumptionByPose.x);
            stamina.AimConsumptionByPose.y = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.AimConsumptionByPose.y);
            stamina.AimConsumptionByPose.z = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.AimConsumptionByPose.z);
            stamina.AimDrainRate = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.AimDrainRate);
            stamina.AimRangeFinderDrainRate = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.AimRangeFinderDrainRate);
            stamina.BaseHoldBreathConsumption = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.BaseHoldBreathConsumption);
            stamina.BaseRestorationRate = this.calculateRelativePercentage(this.config.percent_stamina, stamina.BaseRestorationRate);
            stamina.Capacity = this.calculateRelativePercentage(this.config.percent_stamina, stamina.Capacity);
            stamina.CrouchConsumption.x = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.CrouchConsumption.x);
            stamina.CrouchConsumption.y = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.CrouchConsumption.y);
            stamina.GrenadeHighThrow = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.GrenadeHighThrow);
            stamina.GrenadeLowThrow = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.GrenadeLowThrow);
            stamina.HoldBreathStaminaMultiplier.x = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.HoldBreathStaminaMultiplier.x);
            stamina.HoldBreathStaminaMultiplier.y = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.HoldBreathStaminaMultiplier.y);
            stamina.HandsCapacity = this.calculateRelativePercentage(this.config.percent_stamina, stamina.HandsCapacity);
            stamina.HandsRestoration = this.calculateRelativePercentage(this.config.percent_stamina, stamina.HandsRestoration);
            stamina.JumpConsumption = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.JumpConsumption);
            stamina.OxygenCapacity = this.calculateRelativePercentage(this.config.percent_stamina, stamina.OxygenCapacity);
            stamina.OxygenRestoration = this.calculateRelativePercentage(this.config.percent_stamina, stamina.OxygenRestoration);
            stamina.PoseLevelConsumptionPerNotch.x = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.PoseLevelConsumptionPerNotch.x);
            stamina.PoseLevelConsumptionPerNotch.y = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.PoseLevelConsumptionPerNotch.y);
            stamina.ProneConsumption = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.ProneConsumption);
            stamina.SitToStandConsumption = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.SitToStandConsumption);
            stamina.SprintDrainRate = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.SprintDrainRate);
            stamina.StandupConsumption.x = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.StandupConsumption.x);
            stamina.StandupConsumption.y = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.StandupConsumption.y);
            stamina.WalkConsumption.x = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.WalkConsumption.x);
            stamina.WalkConsumption.y = this.calculateRelativePercentage(-(this.config.percent_stamina), stamina.WalkConsumption.y);

            logger.info(`CustomStamina: All leg and hand stamina settings have been adjusted by ${(this.config.percent_stamina > 0 ? "+" : "")}${this.config.percent_stamina}%.`);
        }
        else if (this.config.adjustment_method === "fixed")
        {
            if (debug && stamina.AimConsumptionByPose.x !== this.config.AimConsumptionByPose.x)
                logger.info(`CustomStamina: Value for 'AimConsumptionByPose.x' has been been adjusted from ${stamina.AimConsumptionByPose.x} to ${this.config.AimConsumptionByPose.x}.`);
            stamina.AimConsumptionByPose.x = this.config.AimConsumptionByPose.x;

            if (debug && stamina.AimConsumptionByPose.y !== this.config.AimConsumptionByPose.y)
                logger.info(`CustomStamina: Value for 'AimConsumptionByPose.y' has been been adjusted from ${stamina.AimConsumptionByPose.y} to ${this.config.AimConsumptionByPose.y}.`);
            stamina.AimConsumptionByPose.y = this.config.AimConsumptionByPose.y;

            if (debug && stamina.AimConsumptionByPose.z !== this.config.AimConsumptionByPose.z)
                logger.info(`CustomStamina: Value for 'AimConsumptionByPose.z' has been been adjusted from ${stamina.AimConsumptionByPose.z} to ${this.config.AimConsumptionByPose.z}.`);
            stamina.AimConsumptionByPose.z = this.config.AimConsumptionByPose.z;

            if (debug && stamina.AimDrainRate !== this.config.AimDrainRate)
                logger.info(`CustomStamina: Value for 'AimDrainRate' has been been adjusted from ${stamina.AimDrainRate} to ${this.config.AimDrainRate}.`);
            stamina.AimDrainRate = this.config.AimDrainRate;

            if (debug && stamina.AimRangeFinderDrainRate !== this.config.AimRangeFinderDrainRate)
                logger.info(`CustomStamina: Value for 'AimRangeFinderDrainRate' has been been adjusted from ${stamina.AimRangeFinderDrainRate} to ${this.config.AimRangeFinderDrainRate}.`);
            stamina.AimRangeFinderDrainRate = this.config.AimRangeFinderDrainRate;
            
            if (debug && stamina.BaseHoldBreathConsumption !== this.config.BaseHoldBreathConsumption)
                logger.info(`CustomStamina: Value for 'BaseHoldBreathConsumption' has been been adjusted from ${stamina.BaseHoldBreathConsumption} to ${this.config.BaseHoldBreathConsumption}.`);
            stamina.BaseHoldBreathConsumption = this.config.BaseHoldBreathConsumption;
            
            if (debug && stamina.BaseRestorationRate !== this.config.BaseRestorationRate)
                logger.info(`CustomStamina: Value for 'BaseRestorationRate' has been been adjusted from ${stamina.BaseRestorationRate} to ${this.config.BaseRestorationRate}.`);
            stamina.BaseRestorationRate = this.config.BaseRestorationRate;

            if (debug && stamina.Capacity !== this.config.Capacity)
                logger.info(`CustomStamina: Value for 'Capacity' has been been adjusted from ${stamina.Capacity} to ${this.config.Capacity}.`);
            stamina.Capacity = this.config.Capacity;

            if (debug && stamina.CrouchConsumption.x !== this.config.CrouchConsumption.x)
                logger.info(`CustomStamina: Value for 'CrouchConsumption.x' has been been adjusted from ${stamina.CrouchConsumption.x} to ${this.config.CrouchConsumption.x}.`);
            stamina.CrouchConsumption.x = this.config.CrouchConsumption.x;

            if (debug && stamina.CrouchConsumption.y !== this.config.CrouchConsumption.y)
                logger.info(`CustomStamina: Value for 'CrouchConsumption.y' has been been adjusted from ${stamina.CrouchConsumption.y} to ${this.config.CrouchConsumption.y}.`);
            stamina.CrouchConsumption.y = this.config.CrouchConsumption.y;

            if (debug && stamina.GrenadeHighThrow !== this.config.GrenadeHighThrow)
                logger.info(`CustomStamina: Value for 'GrenadeHighThrow' has been been adjusted from ${stamina.GrenadeHighThrow} to ${this.config.GrenadeHighThrow}.`);
            stamina.GrenadeHighThrow = this.config.GrenadeHighThrow;

            if (debug && stamina.GrenadeLowThrow !== this.config.GrenadeLowThrow)
                logger.info(`CustomStamina: Value for 'GrenadeLowThrow' has been been adjusted from ${stamina.GrenadeLowThrow} to ${this.config.GrenadeLowThrow}.`);
            stamina.GrenadeLowThrow = this.config.GrenadeLowThrow;

            if (debug && stamina.HoldBreathStaminaMultiplier.x !== this.config.HoldBreathStaminaMultiplier.x)
                logger.info(`CustomStamina: Value for 'HoldBreathStaminaMultiplier.x' has been been adjusted from ${stamina.HoldBreathStaminaMultiplier.x} to ${this.config.HoldBreathStaminaMultiplier.x}.`);
            stamina.HoldBreathStaminaMultiplier.x = this.config.HoldBreathStaminaMultiplier.x;

            if (debug && stamina.HoldBreathStaminaMultiplier.y !== this.config.HoldBreathStaminaMultiplier.y)
                logger.info(`CustomStamina: Value for 'HoldBreathStaminaMultiplier.y' has been been adjusted from ${stamina.HoldBreathStaminaMultiplier.y} to ${this.config.HoldBreathStaminaMultiplier.y}.`);
            stamina.HoldBreathStaminaMultiplier.y = this.config.HoldBreathStaminaMultiplier.y;

            if (debug && stamina.HandsCapacity !== this.config.HandsCapacity)
                logger.info(`CustomStamina: Value for 'HandsCapacity' has been been adjusted from ${stamina.HandsCapacity} to ${this.config.HandsCapacity}.`);
            stamina.HandsCapacity = this.config.HandsCapacity;

            if (debug && stamina.HandsRestoration !== this.config.HandsRestoration)
                logger.info(`CustomStamina: Value for 'HandsRestoration' has been been adjusted from ${stamina.HandsRestoration} to ${this.config.HandsRestoration}.`);
            stamina.HandsRestoration = this.config.HandsRestoration;

            if (debug && stamina.JumpConsumption !== this.config.JumpConsumption)
                logger.info(`CustomStamina: Value for 'JumpConsumption' has been been adjusted from ${stamina.JumpConsumption} to ${this.config.JumpConsumption}.`);
            stamina.JumpConsumption = this.config.JumpConsumption;

            if (debug && stamina.OxygenCapacity !== this.config.OxygenCapacity)
                logger.info(`CustomStamina: Value for 'OxygenCapacity' has been been adjusted from ${stamina.OxygenCapacity} to ${this.config.OxygenCapacity}.`);
            stamina.OxygenCapacity = this.config.OxygenCapacity;

            if (debug && stamina.OxygenRestoration !== this.config.OxygenRestoration)
                logger.info(`CustomStamina: Value for 'OxygenRestoration' has been been adjusted from ${stamina.OxygenRestoration} to ${this.config.OxygenRestoration}.`);
            stamina.OxygenRestoration = this.config.OxygenRestoration;

            if (debug && stamina.PoseLevelConsumptionPerNotch.x !== this.config.PoseLevelConsumptionPerNotch.x)
                logger.info(`CustomStamina: Value for 'PoseLevelConsumptionPerNotch.x' has been been adjusted from ${stamina.PoseLevelConsumptionPerNotch.x} to ${this.config.PoseLevelConsumptionPerNotch.x}.`);
            stamina.PoseLevelConsumptionPerNotch.x = this.config.PoseLevelConsumptionPerNotch.x;

            if (debug && stamina.PoseLevelConsumptionPerNotch.y !== this.config.PoseLevelConsumptionPerNotch.y)
                logger.info(`CustomStamina: Value for 'PoseLevelConsumptionPerNotch.y' has been been adjusted from ${stamina.PoseLevelConsumptionPerNotch.y} to ${this.config.PoseLevelConsumptionPerNotch.y}.`);
            stamina.PoseLevelConsumptionPerNotch.y = this.config.PoseLevelConsumptionPerNotch.y;

            if (debug && stamina.ProneConsumption !== this.config.ProneConsumption)
                logger.info(`CustomStamina: Value for 'ProneConsumption' has been been adjusted from ${stamina.ProneConsumption} to ${this.config.ProneConsumption}.`);
            stamina.ProneConsumption = this.config.ProneConsumption;

            if (debug && stamina.SitToStandConsumption !== this.config.SitToStandConsumption)
                logger.info(`CustomStamina: Value for 'SitToStandConsumption' has been been adjusted from ${stamina.SitToStandConsumption} to ${this.config.SitToStandConsumption}.`);
            stamina.SitToStandConsumption = this.config.SitToStandConsumption;

            if (debug && stamina.SprintDrainRate !== this.config.SprintDrainRate)
                logger.info(`CustomStamina: Value for 'SprintDrainRate' has been been adjusted from ${stamina.SprintDrainRate} to ${this.config.SprintDrainRate}.`);
            stamina.SprintDrainRate = this.config.SprintDrainRate;

            if (debug && stamina.StaminaExhaustionCausesJiggle !== this.config.StaminaExhaustionCausesJiggle)
                logger.info(`CustomStamina: Value for 'StaminaExhaustionCausesJiggle' has been been adjusted from ${stamina.StaminaExhaustionCausesJiggle} to ${this.config.StaminaExhaustionCausesJiggle}.`);
            stamina.StaminaExhaustionCausesJiggle = this.config.StaminaExhaustionCausesJiggle;

            if (debug && stamina.StaminaExhaustionRocksCamera !== this.config.StaminaExhaustionRocksCamera)
                logger.info(`CustomStamina: Value for 'StaminaExhaustionRocksCamera' has been been adjusted from ${stamina.StaminaExhaustionRocksCamera} to ${this.config.StaminaExhaustionRocksCamera}.`);
            stamina.StaminaExhaustionRocksCamera = this.config.StaminaExhaustionRocksCamera;

            if (debug && stamina.StaminaExhaustionStartsBreathSound !== this.config.StaminaExhaustionStartsBreathSound)
                logger.info(`CustomStamina: Value for 'StaminaExhaustionStartsBreathSound' has been been adjusted from ${stamina.StaminaExhaustionStartsBreathSound} to ${this.config.StaminaExhaustionStartsBreathSound}.`);
            stamina.StaminaExhaustionStartsBreathSound = this.config.StaminaExhaustionStartsBreathSound;

            if (debug && stamina.StandupConsumption.x !== this.config.StandupConsumption.x)
                logger.info(`CustomStamina: Value for 'StandupConsumption.x' has been been adjusted from ${stamina.StandupConsumption.x} to ${this.config.StandupConsumption.x}.`);
            stamina.StandupConsumption.x = this.config.StandupConsumption.x;

            if (debug && stamina.StandupConsumption.y !== this.config.StandupConsumption.y)
                logger.info(`CustomStamina: Value for 'StandupConsumption.y' has been been adjusted from ${stamina.StandupConsumption.y} to ${this.config.StandupConsumption.y}.`);
            stamina.StandupConsumption.y = this.config.StandupConsumption.y;

            if (debug && stamina.WalkConsumption.x !== this.config.WalkConsumption.x)
                logger.info(`CustomStamina: Value for 'WalkConsumption.x' has been been adjusted from ${stamina.WalkConsumption.x} to ${this.config.WalkConsumption.x}.`);
            stamina.WalkConsumption.x = this.config.WalkConsumption.x;

            if (debug && stamina.WalkConsumption.y !== this.config.WalkConsumption.y)
                logger.info(`CustomStamina: Value for 'WalkConsumption.y' has been been adjusted from ${stamina.WalkConsumption.y} to ${this.config.WalkConsumption.y}.`);
            stamina.WalkConsumption.y = this.config.WalkConsumption.y;

            if (!debug)
                logger.info("CustomStamina: Leg and hand stamina has been manually adjusted.");
        }
    }

    private calculateRelativePercentage(percentage: number, value: number)
    {
        // Calculate the relative percentage of a value.
        // Example: 50% (increase) to 0.5 = 0.75
        //         -50% (decrease) to 0.5 = 0.25
        const increase = percentage >= 0;
        const differencePercentage = increase ? percentage : percentage * -1;
        const difference = (differencePercentage / 100) * value;
        value = increase ? (value + difference) : (value - difference);
        
        // Round the new value to max 4 decimal places.
        value = Math.round(value * 10000) / 10000;

        return value > 0 ? value : 0;
    }
}

module.exports = { mod: new CustomStamina() }