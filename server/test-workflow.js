import 'dotenv/config';
import compiledWorkflow from './langgraph/workflow.js';

async function test() {
  console.log('Testing LangGraph workflow for "Gallantt Ispat Ltd"...');
  try {
    const finalState = await compiledWorkflow.invoke({
      companyName: 'Gallantt Ispat Ltd'
    });
    console.log('\n--- SUCCESS ---');
    console.log('Ticker:', finalState.symbol);
    console.log('Company:', finalState.companyInfo.name);
    console.log('Sector:', finalState.companyInfo.sector);
    console.log('CEO:', finalState.companyInfo.ceo);
    console.log('Overall Risk Score:', finalState.riskAnalysis?.overallScore);
    console.log('Overall Growth Score:', finalState.growthAnalysis?.overallScore);
    console.log('Recommendation Decision:', finalState.recommendation?.decision);
    console.log('Confidence Score:', finalState.recommendation?.confidenceScore);
    console.log('Reasoning Snippet:', finalState.recommendation?.reasoning?.slice(0, 150) + '...');
    console.log('SWOT Opportunities:', finalState.swot?.opportunities);
    console.log('News Items Count:', finalState.newsSentiment?.length);
  } catch (error) {
    console.error('Workflow test failed:', error);
  }
}

test();
