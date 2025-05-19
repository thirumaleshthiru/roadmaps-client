import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { ChevronRight, FileText, Upload, Search, Award, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI('AIzaSyBmU-6zbaAKVpc8biv_NnA6opYJ5AER5HA');

function AIAtsChecker() {
  const [currentUrl] = useCurrentLocation();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    setError(null);
    const file = event.target.files[0];
    
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only');
      return;
    }
    
    setFileName(file.name);
    
    try {
      // Use PDF.js to extract text from the PDF
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          setNumPages(pdf.numPages);
          
          let fullText = '';
          
          // Extract text from each page
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');
            fullText += textItems + ' ';
          }
          
          setResumeText(fullText);
        } catch (err) {
          console.error('Error reading PDF:', err);
          setError('Failed to extract text from the PDF. Please try another file.');
        }
      };
      
      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error handling file:', err);
      setError('Failed to process the file. Please try again.');
    }
  };

  const analyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      setAnalysisProgress(20);
      
      const prompt = `
        Analyze this resume against the provided job description for ATS (Applicant Tracking System) compatibility and effectiveness.
        
        RESUME TEXT:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Format your response as a JSON object with the following structure:
        {
          "ats_score": 85, // score out of 100
          "summary": "Brief 2-3 sentence overall assessment",
          "keyword_match": {
            "score": 80, // score out of 100
            "matched_keywords": ["skill1", "skill2", "experience1"],
            "missing_keywords": ["skill3", "experience2"]
          },
          "format_assessment": {
            "score": 85, // score out of 100
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"]
          },
          "content_quality": {
            "score": 90, // score out of 100
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"]
          },
          "improvement_suggestions": [
            {
              "original": "Original text or section from resume",
              "improved": "Suggested improved version with better keywords/phrasing",
              "explanation": "Why this improvement helps with ATS scanning"
            },
            // Include 3-5 specific improvements
          ]
        }
        
        IMPORTANT GUIDELINES:
        1. Be thorough and realistic in your assessment
        2. For the ATS score, consider keyword matches, formatting, content quality, and overall effectiveness
        3. Identify both strengths and weaknesses in the resume
        4. Provide actionable improvement suggestions with specific examples
        5. Focus on ATS optimization while maintaining human readability
        6. Pay special attention to skill keywords, action verbs, and quantifiable achievements
        7. Consider both technical and soft skills relevant to the position
        
        Return ONLY the JSON object with no additional text.
      `;

      setAnalysisProgress(40);
      const result = await model.generateContent(prompt);
      setAnalysisProgress(70);
      const responseText = await result.response.text();
      setAnalysisProgress(90);
      
      try {
        // Extract JSON from the response
        const jsonStr = responseText.replace(/```json|```/g, '').trim();
        const analysisData = JSON.parse(jsonStr);
        setAnalysisResult(analysisData);
        setAnalysisProgress(100);
      } catch (jsonError) {
        console.error('Error parsing AI response:', jsonError);
        console.log('Raw response:', responseText);
        setError('Failed to analyze resume. Please try again.');
        
        // Try to extract JSON with a more lenient approach
        try {
          const jsonStartIndex = responseText.indexOf('{');
          const jsonEndIndex = responseText.lastIndexOf('}');
          
          if (jsonStartIndex >= 0 && jsonEndIndex >= 0) {
            const extractedJson = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
            const analysisData = JSON.parse(extractedJson);
            setAnalysisResult(analysisData);
            setError(null);
            setAnalysisProgress(100);
          }
        } catch (fallbackError) {
          console.error('Fallback extraction failed:', fallbackError);
        }
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError('Failed to analyze resume. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeText('');
    setJobDescription('');
    setAnalysisResult(null);
    setError(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isAnalyzing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">Analyzing your resume for ATS compatibility...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">Evaluating keywords, format and content quality</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI ATS Resume Checker | Optimize Your Resume</title>
        <meta
          name="description"
          content="Analyze your resume against job descriptions with our AI-powered ATS checker. Get instant feedback and optimization suggestions."
        />
        <link rel="canonical" href={currentUrl} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            AI-POWERED ATS RESUME CHECKER
          </h1>
          <p className="text-md md:text-lg text-blue-100 mb-6">
            Upload your resume and paste a job description to get instant ATS compatibility analysis and optimization suggestions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
          <ChevronRight size={16} />
          <span className="font-medium text-indigo-600">ATS Resume Checker</span>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!analysisResult ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <FileText className="text-blue-500 mr-2" size={24} />
                <h2 className="text-xl font-semibold">Upload Your Resume</h2>
              </div>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileUpload} 
                />
                
                {fileName ? (
                  <>
                    <div className="flex items-center justify-center bg-blue-50 p-3 rounded-full mb-4">
                      <FileText className="text-blue-500" size={24} />
                    </div>
                    <p className="text-gray-700 font-medium">{fileName}</p>
                    <p className="text-sm text-gray-500 mt-1">{numPages} page{numPages !== 1 ? 's' : ''}</p>
                    <button 
                      className="mt-4 text-sm text-blue-500 hover:text-blue-700 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current.click();
                      }}
                    >
                      <Upload size={16} className="mr-1" />
                      Change file
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="text-gray-400 mb-4" size={40} />
                    <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">PDF files only</p>
                  </>
                )}
              </div>
              
              {resumeText && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Extracted text preview:</p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto">
                    {resumeText.substring(0, 300)}...
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <Search className="text-blue-500 mr-2" size={24} />
                <h2 className="text-xl font-semibold">Enter Job Description</h2>
              </div>
              
              <form onSubmit={analyzeResume}>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Reset
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!resumeText || !jobDescription}
                    className={`px-6 py-2 rounded-md text-white flex items-center ${
                      !resumeText || !jobDescription
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Award size={20} className="mr-2" />
                    Analyze Resume
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-gray-800">ATS Analysis Results</h2>
                <div className="mt-4 md:mt-0 flex items-center">
                  <div className="text-3xl font-bold mr-3 flex items-center">
                    <span className={getScoreColor(analysisResult.ats_score)}>
                      {analysisResult.ats_score}
                    </span>
                    <span className="text-gray-500 text-lg ml-1">/100</span>
                  </div>
                  <div className="h-14 w-14 relative">
                    <div 
                      className="h-14 w-14 rounded-full border-4 border-gray-200"
                      style={{
                        background: `conic-gradient(${analysisResult.ats_score >= 80 ? '#10B981' : analysisResult.ats_score >= 60 ? '#F59E0B' : '#EF4444'} ${analysisResult.ats_score * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    >
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        {analysisResult.ats_score >= 80 ? (
                          <CheckCircle className="text-green-500" size={16} />
                        ) : (
                          <AlertCircle className={analysisResult.ats_score >= 60 ? "text-yellow-500" : "text-red-500"} size={16} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{analysisResult.summary}</p>
            </div>
            
            <div className="grid md:grid-cols-3 border-b border-gray-200">
              <div className="p-6 border-r border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  Keyword Match 
                  <span className={`ml-2 ${getScoreColor(analysisResult.keyword_match.score)}`}>
                    {analysisResult.keyword_match.score}/100
                  </span>
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Matched Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keyword_match.matched_keywords.map((keyword, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Missing Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keyword_match.missing_keywords.map((keyword, idx) => (
                      <span key={idx} className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-r border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  Format Assessment
                  <span className={`ml-2 ${getScoreColor(analysisResult.format_assessment.score)}`}>
                    {analysisResult.format_assessment.score}/100
                  </span>
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Strengths:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysisResult.format_assessment.strengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-700">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Weaknesses:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysisResult.format_assessment.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-gray-700">{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  Content Quality
                  <span className={`ml-2 ${getScoreColor(analysisResult.content_quality.score)}`}>
                    {analysisResult.content_quality.score}/100
                  </span>
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Strengths:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysisResult.content_quality.strengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-700">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Weaknesses:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysisResult.content_quality.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-gray-700">{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Improvement Suggestions</h3>
              
              <div className="space-y-6">
                {analysisResult.improvement_suggestions.map((suggestion, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid md:grid-cols-2">
                      <div className="p-4 bg-red-50 border-r border-gray-200">
                        <p className="text-sm text-red-800 font-medium mb-2">Original</p>
                        <p className="text-gray-700">{suggestion.original}</p>
                      </div>
                      <div className="p-4 bg-green-50">
                        <p className="text-sm text-green-800 font-medium mb-2">Improved</p>
                        <p className="text-gray-700">{suggestion.improved}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{suggestion.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 flex justify-between">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                Analyze another resume
              </button>
              
              <button 
                onClick={() => window.print()} 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Results
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AIAtsChecker;