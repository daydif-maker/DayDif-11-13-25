#!/bin/bash
# DayDif Edge Function Deployment Script
# Phase 5 of Backend Implementation Guide

echo "🚀 DayDif Edge Function Deployment"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking required configuration..."
    
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        echo -e "${YELLOW}⚠️  SUPABASE_PROJECT_REF not set${NC}"
        echo "   Get your project ref from: Supabase Dashboard → Settings → General → Reference ID"
        echo "   Then run: export SUPABASE_PROJECT_REF=your-project-ref"
        return 1
    fi
    
    if [ -z "$CONTENT_SERVICE_URL" ]; then
        echo -e "${YELLOW}⚠️  CONTENT_SERVICE_URL not set${NC}"
        echo "   This is your Modal content service URL"
        echo "   Example: export CONTENT_SERVICE_URL=https://your-username--daydif-content-generate-content.modal.run"
        return 1
    fi
    
    if [ -z "$TTS_SERVICE_URL" ]; then
        echo -e "${YELLOW}⚠️  TTS_SERVICE_URL not set${NC}"
        echo "   This is your Modal TTS service URL"
        echo "   Example: export TTS_SERVICE_URL=https://your-username--daydif-tts-generate-tts.modal.run"
        return 1
    fi
    
    echo -e "${GREEN}✅ All environment variables set${NC}"
    return 0
}

# Step 1: Link to Supabase project
link_project() {
    echo ""
    echo "📦 Step 1: Linking to Supabase project..."
    
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        echo -e "${RED}❌ SUPABASE_PROJECT_REF not set. Please set it first.${NC}"
        return 1
    fi
    
    supabase link --project-ref "$SUPABASE_PROJECT_REF"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Project linked successfully${NC}"
    else
        echo -e "${RED}❌ Failed to link project${NC}"
        return 1
    fi
}

# Step 2: Set edge function secrets
set_secrets() {
    echo ""
    echo "🔐 Step 2: Setting Edge Function secrets..."
    
    if [ -z "$CONTENT_SERVICE_URL" ] || [ -z "$TTS_SERVICE_URL" ]; then
        echo -e "${RED}❌ Service URLs not set. Please set CONTENT_SERVICE_URL and TTS_SERVICE_URL first.${NC}"
        return 1
    fi
    
    echo "   Setting CONTENT_SERVICE_URL..."
    supabase secrets set CONTENT_SERVICE_URL="$CONTENT_SERVICE_URL"
    
    echo "   Setting TTS_SERVICE_URL..."
    supabase secrets set TTS_SERVICE_URL="$TTS_SERVICE_URL"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Secrets set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set secrets${NC}"
        return 1
    fi
}

# Step 3: Deploy edge function
deploy_function() {
    echo ""
    echo "🚀 Step 3: Deploying Edge Function..."
    
    supabase functions deploy generate-lesson
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Edge function deployed successfully${NC}"
        echo ""
        echo "📍 Your edge function URL:"
        echo "   https://$SUPABASE_PROJECT_REF.supabase.co/functions/v1/generate-lesson"
    else
        echo -e "${RED}❌ Failed to deploy function${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo "Before running this script, set these environment variables:"
    echo ""
    echo "  export SUPABASE_PROJECT_REF=your-project-ref"
    echo "  export CONTENT_SERVICE_URL=https://your-username--daydif-content-generate-content.modal.run"
    echo "  export TTS_SERVICE_URL=https://your-username--daydif-tts-generate-tts.modal.run"
    echo ""
    
    # Check if running with --check flag
    if [ "$1" == "--check" ]; then
        check_env_vars
        exit $?
    fi
    
    # Check if running with --deploy flag
    if [ "$1" == "--deploy" ]; then
        check_env_vars || exit 1
        link_project || exit 1
        set_secrets || exit 1
        deploy_function || exit 1
        
        echo ""
        echo -e "${GREEN}🎉 Phase 5 Complete!${NC}"
        echo ""
        echo "Your edge function is now deployed and ready to use."
        echo ""
        echo "Test it with:"
        echo "  curl -X POST https://$SUPABASE_PROJECT_REF.supabase.co/functions/v1/generate-lesson \\"
        echo "    -H 'Content-Type: application/json' \\"
        echo "    -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
        echo "    -d '{\"topic\": \"Test\", \"lessonId\": \"test\", \"userId\": \"test\"}'"
        exit 0
    fi
    
    echo "Usage:"
    echo "  ./scripts/deploy-edge-function.sh --check   # Check environment variables"
    echo "  ./scripts/deploy-edge-function.sh --deploy  # Deploy edge function"
}

main "$@"

