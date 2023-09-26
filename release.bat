@echo off
dotnet build src/Limbo.Umbraco.Maps --configuration Release /t:rebuild /t:pack -p:PackageOutputPath=../../releases/nuget