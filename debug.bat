@echo off
dotnet build src/Limbo.Umbraco.Maps --configuration Debug /t:rebuild /t:pack -p:PackageOutputPath=c:/nuget