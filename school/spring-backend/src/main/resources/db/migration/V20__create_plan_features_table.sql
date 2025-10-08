-- V20__create_plan_features_table.sql
-- Creates the junction table for plan-feature mapping

CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, feature_id)
);

CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature_id ON plan_features(feature_id);

